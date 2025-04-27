import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, DollarSign, Clock, CheckCheck, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';
import { usePayments } from '../context/PaymentContext';
import { Contract, Milestone } from '../types';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { contracts, getUserContracts } = useContracts();
  const { payments } = usePayments();
  const [userContracts, setUserContracts] = useState<Contract[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const contracts = getUserContracts(currentUser.id);
      setUserContracts(contracts);
    }
  }, [currentUser, contracts, getUserContracts]);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const isFreelancer = currentUser.role === 'freelancer';

  // Calculate statistics
  const activeContracts = userContracts.filter(c => c.status === 'active').length;
  const completedContracts = userContracts.filter(c => c.status === 'completed').length;
  const pendingMilestones = userContracts.flatMap(c => 
    c.milestones.filter(m => m.status === 'in_progress' || m.status === 'pending')
  ).length;
  
  const totalEarnings = isFreelancer
    ? payments.filter(p => 
        userContracts.some(c => c.id === p.contractId && c.freelancer === currentUser.id) && 
        p.status === 'released'
      ).reduce((sum, p) => sum + p.amount, 0)
    : payments.filter(p => 
        userContracts.some(c => c.id === p.contractId && c.client === currentUser.id) && 
        p.status === 'released'
      ).reduce((sum, p) => sum + p.amount, 0);

  // Get upcoming milestones for the current user
  const upcomingMilestones = userContracts
    .flatMap(contract => contract.milestones
      .filter(milestone => ['pending', 'in_progress'].includes(milestone.status))
      .map(milestone => ({ ...milestone, contractId: contract.id, contractTitle: contract.title }))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const getStatusBadgeVariant = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch(status) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'secondary';
      case 'disputed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const differenceInTime = due.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser.name}</h1>
          <p className="text-gray-600 mt-1">Here's an overview of your {isFreelancer ? 'freelance work' : 'projects'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/contracts/new')}
          >
            {isFreelancer ? 'Create Proposal' : 'Post New Project'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <DollarSign className="h-6 w-6 text-blue-800" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isFreelancer ? 'Total Earnings' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 mr-4">
                <CheckCheck className="h-6 w-6 text-teal-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-gray-900">{completedContracts}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{activeContracts}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white">
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <AlertTriangle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Milestones</p>
                <p className="text-2xl font-bold text-gray-900">{pendingMilestones}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          <Button 
            variant="outline" 
            size="sm"
            rightIcon={<ChevronRight size={16} />}
            onClick={() => navigate('/contracts')}
          >
            View all
          </Button>
        </div>
        
        {userContracts.length === 0 ? (
          <Card className="bg-white">
            <CardBody className="p-6 text-center">
              <p className="text-gray-600">You don't have any projects yet.</p>
              <Button 
                className="mt-4" 
                leftIcon={<Plus size={16} />}
                onClick={() => navigate('/contracts/new')}
              >
                {isFreelancer ? 'Create Proposal' : 'Post New Project'}
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userContracts.slice(0, 3).map((contract) => (
              <Card key={contract.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{contract.title}</h3>
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{contract.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Value</p>
                      <p className="text-sm font-medium">${contract.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Milestones</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-800 h-2 rounded-full"
                        style={{
                          width: `${(contract.milestones.filter(m => m.status === 'completed' || m.status === 'approved').length / contract.milestones.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {contract.milestones.filter(m => m.status === 'completed' || m.status === 'approved').length} of {contract.milestones.length} completed
                    </p>
                  </div>
                </CardBody>
                <CardFooter className="bg-gray-50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Milestones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Milestones</h2>
        </div>
        
        {upcomingMilestones.length === 0 ? (
          <Card className="bg-white">
            <CardBody className="p-6 text-center">
              <p className="text-gray-600">You don't have any upcoming milestones.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="overflow-hidden shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingMilestones.map((milestone) => {
                  const daysRemaining = getDaysRemaining(milestone.dueDate);
                  const isOverdue = daysRemaining < 0;
                  
                  return (
                    <tr key={milestone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{milestone.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{milestone.contractTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(milestone.dueDate)}
                          {isOverdue ? (
                            <span className="ml-2 text-xs text-red-600 font-medium">
                              {Math.abs(daysRemaining)} days overdue
                            </span>
                          ) : (
                            <span className="ml-2 text-xs text-gray-500">
                              ({daysRemaining} days left)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${milestone.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(milestone.status)}>
                          {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;