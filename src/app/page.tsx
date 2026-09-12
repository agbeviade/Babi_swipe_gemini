import AppShell from '@/components/AppShell';
import { getSessionUser, isStaff } from '@/lib/auth/session';
import { getPublishedProperties } from '@/server/properties';

export default async function HomePage() {
  const [user, properties] = await Promise.all([getSessionUser(), getPublishedProperties()]);

  return <AppShell canAccessAdmin={isStaff(user?.role)} initialProperties={properties} />;
}
