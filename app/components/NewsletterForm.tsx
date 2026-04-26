'use client';

import { useActionState } from 'react';
import { subscribeToNewsletter } from '../actions/newsletter';

export default function NewsletterForm({ 
  formClassName, 
  inputClassName, 
  btnClassName,
  placeholder = "Your email here",
  buttonText = "Join Our Community"
}: { 
  formClassName?: string;
  inputClassName?: string;
  btnClassName?: string;
  placeholder?: string;
  buttonText?: string;
}) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null);

  return (
    <form action={formAction} className={formClassName}>
      <input 
        type="email" 
        name="email"
        placeholder={placeholder} 
        className={inputClassName} 
        required
        disabled={isPending}
      />
      <button type="submit" className={btnClassName} disabled={isPending}>
        {isPending ? 'Subscribing...' : buttonText}
      </button>
      
      {state?.error && (
        <p style={{ color: '#ef4444', width: '100%', marginTop: '8px', fontSize: '14px', fontWeight: '600' }}>
          {state.error}
        </p>
      )}
      {state?.success && (
        <p style={{ color: '#22c55e', width: '100%', marginTop: '8px', fontSize: '14px', fontWeight: '600' }}>
          {state.success}
        </p>
      )}
    </form>
  );
}
