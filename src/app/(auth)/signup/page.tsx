import { redirect } from 'next/navigation';

/** Customer self sign-up no longer exists: businesses register, customers track tickets without an account. */
export default function SignupPage() {
  redirect('/register');
}
