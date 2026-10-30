import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const role = params?.role;
  const mode = params?.mode;

  if (role === 'teacher') {
    redirect(mode === 'signup' ? '/login/teacher?mode=signup' : '/login/teacher');
  }

  redirect(mode === 'signup' ? '/login/student?mode=signup' : '/login/student');
}
