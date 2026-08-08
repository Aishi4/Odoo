const { SecurityDeposit, DepositSettlement, Payment } = require('../models');
const AppError = require('../utils/errors');

class DepositSettlementService {
  get DepositSettlementModel() {
    return DepositSettlement;
  }

  /**
   * Settle security deposit after return confirmation (Phase 5 simple on-time refund)
   */
  async settleDepositOnReturn(orderId, returnTiming, transaction = null) {
    const options = transaction ? { transaction } : {};
    const deposit = await SecurityDeposit.findOne({
      where: { order_id: orderId },
      ...options,
    });

    if (!deposit) return null;

    if (returnTiming === 'ON_TIME') {
      deposit.status = 'REFUNDED';
      deposit.refunded_amount = deposit.amount;
      deposit.deducted_amount = 0.00;
      deposit.refunded_at = new Date();
      await deposit.save(options);

      // Create settlement record
      await DepositSettlement.create({
        deposit_id: deposit.id,
        order_id: orderId,
        deducted_amount: 0.00,
        refunded_amount: deposit.amount,
        outstanding_amount: 0.00,
        settlement_status: 'FULL_REFUND',
      }, options);
    }

    return deposit;
  }

  /**
   * Settle security deposit with calculated late fee (Phase 6 Complex Settlement Math)
   * 
   * @param {Object} params
   * @param {string} params.orderId
   * @param {Object} params.lateFeeRecord
   * @param {boolean} params.isWaived
   * @param {Object} params.transaction
   */
  async settleDepositWithLateFee({ orderId, lateFeeRecord, isWaived = false, transaction = null }) {
    const options = transaction ? { transaction } : {};

    const deposit = await SecurityDeposit.findOne({
      where: { order_id: orderId },
      ...options,
    });

    if (!deposit) {
      throw new AppError('Security deposit record not found for this order', 404);
    }

    const depositAmount = Number(deposit.amount);
    const feeAmount = isWaived ? 0 : Number(lateFeeRecord.final_amount);

    let deductedAmount = 0.00;
    let refundedAmount = 0.00;
    let outstandingAmount = 0.00;
    let settlementStatus = 'FULL_REFUND';

    if (feeAmount === 0 || isWaived) {
      // Full Refund
      deductedAmount = 0.00;
      refundedAmount = depositAmount;
      outstandingAmount = 0.00;
      settlementStatus = 'FULL_REFUND';
      deposit.status = 'REFUNDED';
      deposit.refunded_at = new Date();
    } else if (depositAmount >= feeAmount) {
      // Deposit fully covers late fee
      deductedAmount = feeAmount;
      refundedAmount = Math.round((depositAmount - feeAmount) * 100) / 100;
      outstandingAmount = 0.00;
      settlementStatus = refundedAmount > 0 ? 'PARTIAL_REFUND' : 'FULL_DEDUCTION';

      deposit.status = refundedAmount > 0 ? 'PARTIALLY_REFUNDED' : 'DEDUCTED';
      deposit.refunded_at = refundedAmount > 0 ? new Date() : null;
      lateFeeRecord.status = 'SETTLED';
      await lateFeeRecord.save(options);
    } else {
      // Late fee exceeds deposit -> Deposit fully deducted, remainder is outstanding
      deductedAmount = depositAmount;
      refundedAmount = 0.00;
      outstandingAmount = Math.round((feeAmount - depositAmount) * 100) / 100;
      settlementStatus = 'OUTSTANDING';

      deposit.status = 'DEDUCTED';
      lateFeeRecord.status = 'CALCULATED'; // Remains calculated with outstanding balance
      await lateFeeRecord.save(options);
    }

    deposit.deducted_amount = deductedAmount;
    deposit.refunded_amount = refundedAmount;
    await deposit.save(options);

    // Create or update DepositSettlement history
    let settlement = await DepositSettlement.findOne({
      where: { order_id: orderId, deposit_id: deposit.id },
      ...options,
    });

    if (settlement) {
      settlement.late_fee_id = lateFeeRecord.id;
      settlement.deducted_amount = deductedAmount;
      settlement.refunded_amount = refundedAmount;
      settlement.outstanding_amount = outstandingAmount;
      settlement.settlement_status = settlementStatus;
      settlement.settled_at = new Date();
      await settlement.save(options);
    } else {
      settlement = await DepositSettlement.create({
        deposit_id: deposit.id,
        order_id: orderId,
        late_fee_id: lateFeeRecord.id,
        deducted_amount: deductedAmount,
        refunded_amount: refundedAmount,
        outstanding_amount: outstandingAmount,
        settlement_status: settlementStatus,
        settled_at: new Date(),
      }, options);
    }

    // Record Financial Movement in Payments Table (Phase 4 reuse)
    if (deductedAmount > 0) {
      await Payment.create({
        order_id: orderId,
        customer_id: deposit.customer_id,
        amount: deductedAmount,
        currency: 'INR',
        payment_type: 'SECURITY_DEPOSIT',
        payment_method: 'CASH',
        status: 'SUCCESS',
        transaction_reference: `DEP-DEDUCT-${Date.now()}`,
        paid_at: new Date(),
      }, options);
    }

    if (refundedAmount > 0) {
      await Payment.create({
        order_id: orderId,
        customer_id: deposit.customer_id,
        amount: refundedAmount,
        currency: 'INR',
        payment_type: 'SECURITY_DEPOSIT',
        payment_method: 'ONLINE',
        status: 'REFUNDED',
        transaction_reference: `DEP-REFUND-${Date.now()}`,
        paid_at: new Date(),
      }, options);
    }

    return settlement;
  }
}

module.exports = new DepositSettlementService();
