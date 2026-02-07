import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const origin = req.url ? new URL(req.url).origin : '';

    // Fetch batches options from specialized endpoint (returns mapped batch objects including dates and isActive)
    const authHeader = req.headers.get('authorization') || '';

    const batchesRes = await fetch(`${origin}/api/registrations/batches/options`, {
      cache: 'force-cache',
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    let batches = [];
    if (batchesRes.ok) {
      batches = await batchesRes.json();
    } else {
      // fallback to calling the raw batches endpoint
      const fallback = await fetch(`${origin}/api/registrations/batches`, {
        cache: 'force-cache',
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      });
      if (fallback.ok) batches = await fallback.json();
    }

    // Provide a simple list of academic years (current and previous 2)
    const currentYear = new Date().getFullYear();
    const years = [
      { value: `${currentYear - 1}/${currentYear}`, label: `${currentYear - 1}/${currentYear}` },
    //   { value: `${currentYear - 2}/${currentYear - 1}`, label: `${currentYear - 2}/${currentYear - 1}` },
    //   { value: `${currentYear - 3}/${currentYear - 2}`, label: `${currentYear - 3}/${currentYear - 2}` },
    ];

    const registrationTypes = [
      { value: '', label: 'Semua Jenis Pendaftaran' },
      { value: 'true', label: 'Oleh Guru' },
      { value: 'false', label: 'Mandiri' },
    ];

    return NextResponse.json(
      { years, batches, registrationTypes },
      {
        headers: {
          // Cache at CDNs for 60s and allow stale while revalidating for 5 minutes
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ error: 'failed_to_fetch' }, { status: 500 });
  }
}
