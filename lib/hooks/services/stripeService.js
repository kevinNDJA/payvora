import supabase from '../../supabaseClient';
import { createCheckoutSession } from '../../../utils/stripe';

export async function openCheckoutForUser() {
  try {
    // createCheckoutSession will attach current supabase user id when available
    await createCheckoutSession();
  } catch (e) {
    console.warn('stripeService.openCheckoutForUser failed', e);
    // fallback handled by createCheckoutSession
  }
}

export default { openCheckoutForUser };
