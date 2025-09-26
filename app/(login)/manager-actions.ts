'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { managers, type NewManager, ActivityType } from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getManager, checkIsFirstTimeSetup, logActivity } from '@/lib/db/queries';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export async function signIn(prevState: any, formData: FormData) {
  try {
    const validatedFields = signInSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password')
    });

    if (!validatedFields.success) {
      return {
        error: 'Invalid email or password format',
        email: formData.get('email'),
        password: ''
      };
    }

    const { email, password } = validatedFields.data;

    const manager = await db
      .select()
      .from(managers)
      .where(eq(managers.email, email))
      .limit(1);

    if (manager.length === 0) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password: ''
      };
    }

    const foundManager = manager[0];

    const isPasswordValid = await comparePasswords(password, foundManager.passwordHash);

    if (!isPasswordValid) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password: ''
      };
    }

    await Promise.all([
      setSession(foundManager),
      logActivity(foundManager.id, ActivityType.SIGN_IN, `Manager signed in: ${email}`)
    ]);

    console.log(`✅ Manager ${email} signed in successfully`);
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return {
      error: 'An error occurred during sign in. Please try again.',
      email: formData.get('email'),
      password: ''
    };
  }

  redirect('/dashboard');
}

const signUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signUp(prevState: any, formData: FormData) {
  try {
    // Check if first-time setup is allowed
    const isFirstTime = await checkIsFirstTimeSetup();
    if (!isFirstTime) {
      return {
        error: 'Registration is not allowed. Please contact your administrator.',
        name: formData.get('name'),
        email: formData.get('email'),
        password: ''
      };
    }

    const validatedFields = signUpSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    });

    if (!validatedFields.success) {
      return {
        error: 'Please check your input and try again.',
        name: formData.get('name'),
        email: formData.get('email'),
        password: ''
      };
    }

    const { name, email, password } = validatedFields.data;
    
    const existingManager = await db
      .select()
      .from(managers)
      .where(eq(managers.email, email))
      .limit(1);

    if (existingManager.length > 0) {
      return {
        error: 'An account with this email already exists.',
        name,
        email,
        password: ''
      };
    }

    const passwordHash = await hashPassword(password);

    const newManager: NewManager = {
      name,
      email,
      passwordHash,
      isFirstUser: true // Mark as first user
    };

    const [createdManager] = await db.insert(managers).values(newManager).returning();

    if (!createdManager) {
      return {
        error: 'Failed to create manager account. Please try again.',
        name,
        email,
        password: ''
      };
    }

    await Promise.all([
      setSession(createdManager),
      logActivity(createdManager.id, ActivityType.SIGN_UP, `First manager account created: ${email}`)
    ]);

    console.log(`✅ First manager account created: ${email}`);
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return {
      error: 'Failed to create account. Please try again.',
      name: formData.get('name'),
      email: formData.get('email'),
      password: ''
    };
  }

  redirect('/dashboard');
}

export async function signOut() {
  try {
    const manager = await getManager();
    if (manager) {
      await logActivity(manager.id, ActivityType.SIGN_OUT, `Manager signed out: ${manager.email}`);
    }
    (await cookies()).delete('session');
    console.log('✅ Manager signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
  }
  
  redirect('/sign-in');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export async function updatePassword(prevState: any, formData: FormData) {
  const manager = await getManager();
  if (!manager) {
    return { error: 'Not authenticated' };
  }

  const validatedFields = updatePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword')
  });

  if (!validatedFields.success) {
    return { error: 'Please check your input and try again.' };
  }

  const { currentPassword, newPassword, confirmPassword } = validatedFields.data;

  const isPasswordValid = await comparePasswords(currentPassword, manager.passwordHash);

  if (!isPasswordValid) {
    return {
      error: 'Current password is incorrect.',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  if (currentPassword === newPassword) {
    return {
      error: 'New password must be different from the current password.',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  if (confirmPassword !== newPassword) {
    return {
      error: 'New password and confirmation password do not match.',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  try {
    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(managers)
        .set({ passwordHash: newPasswordHash })
        .where(eq(managers.id, manager.id)),
      logActivity(manager.id, ActivityType.UPDATE_PASSWORD, 'Password updated successfully')
    ]);

    return { success: 'Password updated successfully.' };
  } catch (error) {
    console.error('❌ Password update error:', error);
    return { error: 'Failed to update password. Please try again.' };
  }
}
