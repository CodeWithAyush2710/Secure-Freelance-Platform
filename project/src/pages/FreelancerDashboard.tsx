import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';

const FreelancerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserContracts } = useContracts();
  const navigate = useNavigate();

  if (!currentUser || currentUser.role !== 'freelancer') {
    navigate('/');
    return null;
  }

  const contracts = getUserContracts(currentUser.id);
  const activeContracts = contracts.filter(c => c.status === 'active');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Freelancer Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your contracts and proposals</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/contracts/new')}
          >
            Create Proposal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Active Contracts</h2>
            <p className="text-gray-600">You have {activeContracts.length} active contracts.</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/contracts')}
            >
              View Contracts
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">New Proposal</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter project title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Describe your services"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <Button>Create Proposal</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerDashboard;