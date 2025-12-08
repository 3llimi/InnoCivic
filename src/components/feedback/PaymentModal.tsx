import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
  datasetTitle: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  datasetTitle,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Cardholder name is required';
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Please enter valid expiry date (MM/YY)';
    }

    if (!cvv || cvv.length !== 3) {
      newErrors.cvv = 'Please enter valid 3-digit CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
      onClose();

      // Reset form
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
      setErrors({});
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Purchase Dataset</h2>
          <p className="text-green-100 text-sm mt-1 truncate">{datasetTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₽{amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value.slice(0, 19));
                setCardNumber(formatted);
                if (errors.cardNumber) {
                  setErrors({ ...errors, cardNumber: '' });
                }
              }}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => {
                setCardHolder(e.target.value.toUpperCase());
                if (errors.cardHolder) {
                  setErrors({ ...errors, cardHolder: '' });
                }
              }}
              placeholder="JOHN DOE"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.cardHolder ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cardHolder && (
              <p className="text-sm text-red-600 mt-1">{errors.cardHolder}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value);
                  setExpiryDate(formatted);
                  if (errors.expiryDate) {
                    setErrors({ ...errors, expiryDate: '' });
                  }
                }}
                placeholder="MM/YY"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={5}
              />
              {errors.expiryDate && (
                <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setCvv(value);
                  if (errors.cvv) {
                    setErrors({ ...errors, cvv: '' });
                  }
                }}
                placeholder="123"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={3}
              />
              {errors.cvv && <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              🔒 <strong>Demo Mode:</strong> This is a mock payment. No actual charges will be made.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                `Pay ₽${amount.toLocaleString()}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
