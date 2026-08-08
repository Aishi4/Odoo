/**
 * Mock Payment Service Provider
 * Simulates gateway processing (ONLINE / CASH) for development and testing.
 * Designed as a clean provider abstraction so Razorpay / Stripe can replace it easily.
 */
class MockPaymentService {
  /**
   * Process simulated payment transaction
   * @param {Object} params
   * @param {number} params.amount
   * @param {string} params.currency
   * @param {string} params.payment_method - 'ONLINE' or 'CASH'
   * @param {boolean} params.simulate_failure - optional flag for testing failure flows
   */
  async processMockPayment({ amount, currency = 'INR', payment_method, simulate_failure = false }) {
    // If test explicitly requests failure simulation
    if (simulate_failure) {
      return {
        success: false,
        status: 'FAILED',
        error_message: 'Simulated payment gateway transaction failure',
      };
    }

    // Generate unique mock transaction reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const txnRef = `MOCK-TXN-${Date.now()}-${randomSuffix}`;

    return {
      success: true,
      status: 'SUCCESS',
      transaction_reference: txnRef,
      paid_at: new Date(),
    };
  }
}

module.exports = new MockPaymentService();
