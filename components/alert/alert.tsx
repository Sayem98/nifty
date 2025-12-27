"use client"

import { useEffect } from 'react';

export function useExitAlert(message = "If transaction request has been made, going back will cause problems.") {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (window?.confirm(message)) {
        // If the user confirms, allow the navigation
        return;
      } else {
        // If the user cancels, prevent the navigation
        window?.history.pushState(null, '', window?.location.pathname);
      }
    };

    window?.addEventListener('beforeunload', handleBeforeUnload);
    window?.addEventListener('popstate', handlePopState);

    // Push a new state to the history when the component mounts
    window?.history.pushState(null, '', window?.location.pathname);

    return () => {
      window?.removeEventListener('beforeunload', handleBeforeUnload);
      window?.removeEventListener('popstate', handlePopState);
    };
  }, [message]);
}