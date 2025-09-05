import { auth } from '@/auth';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) return Response.json({ detail: 'Not authenticated' }, { status: 401 });

  // TODO: quando existir no Django:
  // const resp = await fetch(`${process.env.BACKEND_BASE_URL}/api/admin/kpis/`, {
  //   headers: { Authorization: `Bearer ${session.accessToken}` },
  // });
  // const data = await resp.json(); return Response.json(data);

  // MOCK
  return Response.json([
    { key: 'users',   title: 'Uers',   value: 1280, icon: 'user'   },
    { key: 'teams',   title: 'Teams',    value: 18,   icon: 'team'   },
    { key: 'reports', title: 'Reports', value: 64,   icon: 'file'   },
    { key: 'jobs',    title: 'Jobs',value: 22,   icon: 'setting'},
  ]);
}
