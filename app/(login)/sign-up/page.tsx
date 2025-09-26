import { Suspense } from 'react';
import { ManagerLogin } from '../manager-login';

export default function SignUpPage() {
  return (
    <Suspense>
      <ManagerLogin mode="signup" />
    </Suspense>
  );
}
