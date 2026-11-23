import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60; // Allow sufficient time for image processing

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/heic",
    ];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: JPG, PNG, WEBP, AVIF" },
        { status: 400 }
      );
    }

    // Max 10MB
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file exceeds 10MB maximum limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const storagePath = `${user.id}/${filename}`;
    const bucketName = "wardrobe-items";

    // Attempt Supabase storage upload using admin client or authenticated user client
    try {
      const adminClient = createAdminClient();

      // Ensure bucket exists or attempt upload
      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!uploadError && uploadData) {
        // Create a long-lived secure signed URL (1 year)
        const { data: signedData, error: signedError } = await adminClient.storage
          .from(bucketName)
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

        if (!signedError && signedData?.signedUrl) {
          return NextResponse.json({
            storagePath,
            imageUrl: signedData.signedUrl,
          });
        }

        // Fallback to public URL if bucket is public
        const { data: publicUrlData } = adminClient.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        return NextResponse.json({
          storagePath,
          imageUrl: publicUrlData.publicUrl,
        });
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload failed or not configured, using data URL fallback:", storageErr);
    }

    // Fallback for development environments without configured Supabase Storage buckets
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      storagePath: `local/${storagePath}`,
      imageUrl: dataUrl,
    });
  } catch (err: any) {
    console.error("Wardrobe upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
