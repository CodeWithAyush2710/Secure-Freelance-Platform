import React, { createContext, useContext, useState } from "react";
import { Payment } from "../types";
import { useContracts } from "./ContractContext";

interface PaymentContextType {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fundEscrow: (contractId: string, milestoneId: string, amount: number) => Promise<Payment>;
  releasePayment: (paymentId: string) => Promise<Payment>;
  getContractPayments: (contractId: string) => Payment[];
  getMilestonePayment: (milestoneId: string) => Payment | undefined;
}

// Mock data for demo purposes
const initialPayments: Payment[] = [
  {
    id: "p1",
    contractId: "1",
    milestoneId: "m1",
    amount: 1500,
    status: "released",
    date: new Date(2023, 5, 16)
  },
  {
    id: "p2",
    contractId: "1",
    milestoneId: "m2",
    amount: 2000,
    status: "in_escrow",
    date: new Date(2023, 5, 20)
  }
];

const PaymentContext = createContext<PaymentContextType>({
  payments: [],
  loading: false,
  error: null,
  fundEscrow: async () => ({ 
    id: "", contractId: "", milestoneId: "", amount: 0, 
    status: "pending", date: new Date() 
  }),
  releasePayment: async () => ({ 
    id: "", contractId: "", milestoneId: "", amount: 0, 
    status: "pending", date: new Date() 
  }),
  getContractPayments: () => [],
  getMilestonePayment: () => undefined
});

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateMilestone } = useContracts();

  const getContractPayments = (contractId: string) => {
    return payments.filter(payment => payment.contractId === contractId);
  };

  const getMilestonePayment = (milestoneId: string) => {
    return payments.find(payment => payment.milestoneId === milestoneId);
  };

  const fundEscrow = async (contractId: string, milestoneId: string, amount: number): Promise<Payment> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if payment already exists
      const existingPayment = payments.find(p => p.milestoneId === milestoneId);
      if (existingPayment) {
        throw new Error("Payment for this milestone already exists");
      }
      
      const newPayment: Payment = {
        id: `p${payments.length + 1}`,
        contractId,
        milestoneId,
        amount,
        status: "in_escrow",
        date: new Date()
      };
      
      setPayments(prev => [...prev, newPayment]);
      
      // Update milestone status
      await updateMilestone(contractId, milestoneId, { status: "in_progress" });
      
      return newPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fund escrow";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const releasePayment = async (paymentId: string): Promise<Payment> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentIndex = payments.findIndex(p => p.id === paymentId);
      if (paymentIndex === -1) {
        throw new Error("Payment not found");
      }
      
      const payment = payments[paymentIndex];
      if (payment.status !== "in_escrow") {
        throw new Error("Payment must be in escrow to be released");
      }
      
      const updatedPayment: Payment = {
        ...payment,
        status: "released",
        date: new Date()
      };
      
      const newPayments = [...payments];
      newPayments[paymentIndex] = updatedPayment;
      
      setPayments(newPayments);
      
      // Update milestone status
      await updateMilestone(payment.contractId, payment.milestoneId, { status: "completed" });
      
      return updatedPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to release payment";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        error,
        fundEscrow,
        releasePayment,
        getContractPayments,
        getMilestonePayment
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => useContext(PaymentContext);