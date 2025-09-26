import { Suspense } from 'react';
import { ManagerLogin } from '../manager-login';

export default function SignInPage() {
  return (
    <Suspense>
      <ManagerLogin mode="signin" />
    </Suspense>
  );
}
