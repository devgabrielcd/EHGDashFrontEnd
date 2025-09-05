import { auth } from '@/auth';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await auth();
  if (!session?.accessToken) return Response.json({ detail: 'Not authenticated' }, { status: 401 });

  // const { searchParams } = new URL(req.url);
  // const range = searchParams.get('range') ?? '12m';
  // TODO: chamar Django quando existir

  // MOCK
  const data = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 16500 },
    { name: 'Mar', revenue: 14200 },
    { name: 'Apr', revenue: 18900 },
    { name: 'May', revenue: 20300 },
    { name: 'Jun', revenue: 22100 },
    { name: 'Jul', revenue: 21400 },
    { name: 'Aug', revenue: 24700 },
    { name: 'Sep', revenue: 23600 },
    { name: 'Oct', revenue: 26900 },
    { name: 'Nov', revenue: 28100 },
    { name: 'Dec', revenue: 31500 },
  ];
  return Response.json(data);
}
