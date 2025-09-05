import { auth } from '@/auth';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) return Response.json({ detail: 'Not authenticated' }, { status: 401 });

  // TODO: chamar Django quando existir

  // MOCK
  return Response.json({
    api: 'ok',
    db: 'ok',
    storage: 'ok',
    usage: { cpu: 42, mem: 61, disk: 33 },
  });
}
