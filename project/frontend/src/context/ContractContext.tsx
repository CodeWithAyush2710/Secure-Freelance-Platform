import React, { createContext, useContext, useState } from "react";
import { Contract, Milestone } from "../types";

interface ContractContextType {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  getContract: (id: string) => Contract | undefined;
  getUserContracts: (userId: string) => Contract[];
  createContract: (contract: Omit<Contract, "id" | "createdAt" | "updatedAt">) => Promise<Contract>;
  updateContract: (id: string, updates: Partial<Contract>) => Promise<Contract>;
  updateMilestone: (contractId: string, milestoneId: string, updates: Partial<Milestone>) => Promise<Milestone>;
}

// Mock data for demo purposes
const initialContracts: Contract[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete redesign of company website with new branding",
    client: "2", // Sarah
    freelancer: "1", // John
    startDate: new Date(2023, 5, 1),
    totalAmount: 5000,
    status: "active",
    milestones: [
      {
        id: "m1",
        title: "Design Mockups",
        description: "Create mockups for homepage and key pages",
        dueDate: new Date(2023, 5, 15),
        amount: 1500,
        status: "completed",
        deliverables: ["Homepage mockup", "About page mockup", "Contact page mockup"]
      },
      {
        id: "m2",
        title: "Frontend Implementation",
        description: "Implement the approved designs in React",
        dueDate: new Date(2023, 6, 15),
        amount: 2000,
        status: "in_progress",
        deliverables: ["Responsive homepage", "Internal pages", "Navigation components"]
      },
      {
        id: "m3",
        title: "CMS Integration",
        description: "Connect the website to a headless CMS",
        dueDate: new Date(2023, 7, 1),
        amount: 1500,
        status: "pending",
        deliverables: ["CMS setup", "Content modeling", "API integration"]
      }
    ],
    terms: "Payment will be released upon completion of each milestone after client approval.",
    createdAt: new Date(2023, 4, 25),
    updatedAt: new Date(2023, 5, 1)
  }
];

const ContractContext = createContext<ContractContextType>({
  contracts: [],
  loading: false,
  error: null,
  getContract: () => undefined,
  getUserContracts: () => [],
  createContract: async () => ({ 
    id: "", title: "", description: "", client: "", freelancer: "", 
    startDate: new Date(), totalAmount: 0, status: "draft", milestones: [], 
    terms: "", createdAt: new Date(), updatedAt: new Date() 
  }),
  updateContract: async () => ({ 
    id: "", title: "", description: "", client: "", freelancer: "", 
    startDate: new Date(), totalAmount: 0, status: "draft", milestones: [], 
    terms: "", createdAt: new Date(), updatedAt: new Date() 
  }),
  updateMilestone: async () => ({ 
    id: "", title: "", description: "", dueDate: new Date(), 
    amount: 0, status: "pending", deliverables: [] 
  })
});

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = (id: string) => contracts.find(contract => contract.id === id);

  const getUserContracts = (userId: string) => {
    return contracts.filter(
      contract => contract.client === userId || contract.freelancer === userId
    );
  };

  const createContract = async (contract: Omit<Contract, "id" | "createdAt" | "updatedAt">): Promise<Contract> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date();
      const newContract: Contract = {
        ...contract,
        id: `c${contracts.length + 1}`,
        createdAt: now,
        updatedAt: now
      };
      
      setContracts(prev => [...prev, newContract]);
      return newContract;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create contract";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>): Promise<Contract> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const contractIndex = contracts.findIndex(c => c.id === id);
      if (contractIndex === -1) {
        throw new Error("Contract not found");
      }
      
      const updatedContract = {
        ...contracts[contractIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      const newContracts = [...contracts];
      newContracts[contractIndex] = updatedContract;
      
      setContracts(newContracts);
      return updatedContract;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update contract";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (
    contractId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<Milestone> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const contractIndex = contracts.findIndex(c => c.id === contractId);
      if (contractIndex === -1) {
        throw new Error("Contract not found");
      }
      
      const contract = contracts[contractIndex];
      const milestoneIndex = contract.milestones.findIndex(m => m.id === milestoneId);
      
      if (milestoneIndex === -1) {
        throw new Error("Milestone not found");
      }
      
      const updatedMilestone = {
        ...contract.milestones[milestoneIndex],
        ...updates
      };
      
      const updatedMilestones = [...contract.milestones];
      updatedMilestones[milestoneIndex] = updatedMilestone;
      
      const updatedContract = {
        ...contract,
        milestones: updatedMilestones,
        updatedAt: new Date()
      };
      
      const newContracts = [...contracts];
      newContracts[contractIndex] = updatedContract;
      
      setContracts(newContracts);
      return updatedMilestone;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update milestone";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContractContext.Provider
      value={{
        contracts,
        loading,
        error,
        getContract,
        getUserContracts,
        createContract,
        updateContract,
        updateMilestone
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => useContext(ContractContext);