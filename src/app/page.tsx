import AppShell from '@/components/AppShell';
import { getSessionUser, isStaff } from '@/lib/auth/session';

export default async function HomePage() {
  const user = await getSessionUser();

  return <AppShell canAccessAdmin={isStaff(user?.role)} />;
}
