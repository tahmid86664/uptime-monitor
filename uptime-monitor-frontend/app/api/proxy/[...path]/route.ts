import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;
const API_KEY = process.env.API_KEY;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(
  _req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  if (!BACKEND_URL || !API_KEY) {
    return NextResponse.json(
      { error: 'Backend URL or API key is not configured' },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const backendPath = path.join('/');
  const url = `${BACKEND_URL}/${backendPath}`;

  try {
    const response = await fetch(url, {
      headers: { 'x-api-key': API_KEY },
      cache: 'no-store',
    });

    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to connect to backend';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
