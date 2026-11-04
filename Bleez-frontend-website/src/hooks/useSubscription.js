import { useSubscriptionContext } from '../contexts/SubscriptionContext';

/**
 * Custom hook exposing Subscription Context state, actions, and entitlement helpers
 */
export function useSubscription() {
  return useSubscriptionContext();
}

export default useSubscription;
