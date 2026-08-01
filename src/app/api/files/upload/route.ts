import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Max 25MB check
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
    }

    // In a real environment with Supabase Storage, upload to bucket
    // For local dev/demo, generate secure mock storage URL
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const mockStorageUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${fileName}`;

    return NextResponse.json({
      success: true,
      url: mockStorageUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
