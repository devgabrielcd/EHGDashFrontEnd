import { auth } from '@/auth';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await auth();
  if (!session?.accessToken) return Response.json({ detail: 'Not authenticated' }, { status: 401 });

  // const limit = new URL(req.url).searchParams.get('limit') ?? 10;
  // TODO: chamar Django quando existir

  // MOCK
  const items = [
    { time: 'Hoje 10:24', text: 'Backup done', color: 'green' },
    { time: 'Ontem 17:03', text: 'Deploy v1.4.2 in production', color: 'blue' },
    { time: 'Ontem 16:21', text: '2 warnings solved', color: 'gray' },
    { time: 'Ontem 11:00', text: 'New User (Employee02)', color: 'green' },
  ];
  return Response.json(items);
}
