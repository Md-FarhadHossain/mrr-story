'use client';

import { useActionState, useEffect, useState } from 'react';
import { subscribeToNewsletter } from '../actions/newsletter';
import ConfirmationModal from './ConfirmationModal';

export default function NewsletterForm({ 
  formClassName, 
  inputClassName, 
  btnClassName,
  placeholder = "Your email here",
  buttonText = "Subscribe (It's Free)"
}: { 
  formClassName?: string;
  inputClassName?: string;
  btnClassName?: string;
  placeholder?: string;
  buttonText?: string;
}) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowModal(true);
    }
  }, [state]);

  return (
    <>
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
      </form>

      {showModal && <ConfirmationModal onClose={() => setShowModal(false)} />}
    </>
  );
}
