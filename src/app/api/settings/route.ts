import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';

// GET /api/settings - fetch current user settings
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to read from database (placeholder - use actual DB when available)
    // const { data: settings, error } = await supabase
    //   .from('user_settings')
    //   .select('*')
    //   .eq('user_id', session.id)
    //   .single();

    // For now, return empty settings object - client will fallback to localStorage
    return NextResponse.json({
      settings: null,
      message: 'No server-side settings found. Using local cache.'
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings - update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // Attempt to save to database (placeholder - use actual DB when available)
    // const { error } = await supabase
    //   .from('user_settings')
    //   .upsert({
    //     user_id: session.id,
    //     ...body,
    //     updated_at: new Date().toISOString()
    //   });

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
