import { auth } from '@/auth';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await auth();
  if (!session?.accessToken) return Response.json({ detail: 'Not authenticated' }, { status: 401 });

  // const by = new URL(req.url).searchParams.get('by') ?? 'revenue';
  // TODO: chamar Django quando existir

  // MOCK
  const items = [
    { key: '1', name: 'Acme Ltd',   metric: 98, trend: 'up' },
    { key: '2', name: 'Globex',     metric: 86, trend: 'down' },
    { key: '3', name: 'Umbrella',   metric: 74, trend: 'up' },
    { key: '4', name: 'Initech',    metric: 66, trend: 'flat' },
  ];
  return Response.json(items);
}
