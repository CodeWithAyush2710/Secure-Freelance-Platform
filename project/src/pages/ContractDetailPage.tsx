import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useContracts } from '../context/ContractContext';
import { usePayments } from '../context/PaymentContext';
import { Contract, Milestone } from '../types';

const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { getContract, updateMilestone } = useContracts();
  const { fundEscrow, releasePayment, getMilestonePayment } = usePayments();
  const [contract, setContract] = useState<Contract | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'fund' | 'release' | 'complete' | 'dispute'>('fund');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const contractData = getContract(id);
      setContract(contractData);
    }
  }, [id, getContract]);

  if (!contract || !currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="info">Loading contract details...</Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isClient = currentUser.role === 'client';
  const isFreelancer = currentUser.role === 'freelancer';
  const userIsClient = contract.client === currentUser.id;
  const userIsFreelancer = contract.freelancer === currentUser.id;
  
  // Only the contract participants can view it
  if (!userIsClient && !userIsFreelancer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="error">You do not have permission to view this contract.</Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  const handleOpenModal = (milestone: Milestone, action: 'fund' | 'release' | 'complete' | 'dispute') => {
    setSelectedMilestone(milestone);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMilestone(null);
    setError(null);
  };

  const handleAction = async () => {
    if (!selectedMilestone) return;
    
    setLoading(true);
    setError(null);
    
    try {
      switch (modalAction) {
        case 'fund':
          await fundEscrow(contract.id, selectedMilestone.id, selectedMilestone.amount);
          break;
        case 'release':
          const payment = getMilestonePayment(selectedMilestone.id);
          if (payment) {
            await releasePayment(payment.id);
          } else {
            throw new Error("Payment not found");
          }
          break;
        case 'complete':
          await updateMilestone(contract.id, selectedMilestone.id, { status: 'completed' });
          break;
        case 'dispute':
          // In a real app, this would create a dispute record
          await updateMilestone(contract.id, selectedMilestone.id, { status: 'disputed' });
          break;
      }
      
      // Refresh contract
      const updatedContract = getContract(contract.id);
      setContract(updatedContract);
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = () => {
    switch (modalAction) {
      case 'fund':
        return 'Fund Milestone';
      case 'release':
        return 'Release Payment';
      case 'complete':
        return 'Mark as Completed';
      case 'dispute':
        return 'Raise Dispute';
    }
  };

  const getActionDescription = () => {
    switch (modalAction) {
      case 'fund':
        return `This will place $${selectedMilestone?.amount.toLocaleString()} in escrow for "${selectedMilestone?.title}". Funds will be held securely until the milestone is completed and approved.`;
      case 'release':
        return `This will release $${selectedMilestone?.amount.toLocaleString()} from escrow to the freelancer for the completed milestone "${selectedMilestone?.title}". This action cannot be undone.`;
      case 'complete':
        return `This will mark the milestone "${selectedMilestone?.title}" as completed. The client will need to review and approve to release payment.`;
      case 'dispute':
        return `This will raise a dispute for the milestone "${selectedMilestone?.title}". Our team will review the case and help reach a resolution.`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <Badge 
                variant={getStatusBadgeVariant(contract.status)}
                className="ml-3"
              >
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Created on {formatDate(contract.createdAt)} • Last updated {formatDate(contract.updatedAt)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              leftIcon={<MessageCircle size={16} />}
              variant="outline"
            >
              Messages
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Contract Details</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700 mb-6">{contract.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-sm font-medium">{formatDate(contract.startDate)}</p>
                </div>
                {contract.endDate && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-sm font-medium">{formatDate(contract.endDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Contract Value</p>
                  <p className="text-sm font-medium">${contract.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Contract Terms</h3>
                <p className="text-gray-700 text-sm p-4 bg-gray-50 rounded-md">{contract.terms}</p>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Milestones</h2>
                <Badge variant="primary">
                  {contract.milestones.filter(m => m.status === 'completed' || m.status === 'approved').length} of {contract.milestones.length} completed
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-gray-200">
                {contract.milestones.map((milestone, index) => {
                  const payment = getMilestonePayment(milestone.id);
                  const isInEscrow = payment && payment.status === 'in_escrow';
                  const isReleased = payment && payment.status === 'released';
                  
                  return (
                    <li key={milestone.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-md font-medium text-gray-900">{milestone.title}</h3>
                            <Badge 
                              variant={getStatusBadgeVariant(milestone.status)}
                              className="ml-2"
                            >
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Due Date</p>
                              <p className="text-sm">{formatDate(milestone.dueDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="text-sm font-medium">${milestone.amount.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          {milestone.deliverables.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-1">Deliverables</p>
                              <ul className="text-sm text-gray-700 list-disc list-inside">
                                {milestone.deliverables.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {milestone.feedback && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-1">Feedback</p>
                              <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded-md">{milestone.feedback}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                          {/* Client actions */}
                          {userIsClient && (
                            <>
                              {milestone.status === 'pending' && (
                                <Button
                                  size="sm"
                                  leftIcon={<DollarSign size={16} />}
                                  onClick={() => handleOpenModal(milestone, 'fund')}
                                >
                                  Fund Escrow
                                </Button>
                              )}
                              
                              {milestone.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  leftIcon={<CheckCircle size={16} />}
                                  onClick={() => handleOpenModal(milestone, 'release')}
                                >
                                  Release Payment
                                </Button>
                              )}
                              
                              {(milestone.status === 'in_progress' || milestone.status === 'completed') && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  leftIcon={<AlertTriangle size={16} />}
                                  onClick={() => handleOpenModal(milestone, 'dispute')}
                                >
                                  Dispute
                                </Button>
                              )}
                            </>
                          )}
                          
                          {/* Freelancer actions */}
                          {userIsFreelancer && (
                            <>
                              {milestone.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  leftIcon={<CheckCircle size={16} />}
                                  onClick={() => handleOpenModal(milestone, 'complete')}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </>
                          )}
                          
                          {/* Payment status indicators */}
                          {isInEscrow && (
                            <div className="flex items-center text-xs text-blue-600">
                              <DollarSign size={14} className="mr-1" />
                              <span>In Escrow</span>
                            </div>
                          )}
                          
                          {isReleased && (
                            <div className="flex items-center text-xs text-green-600">
                              <CheckCircle size={14} className="mr-1" />
                              <span>Paid</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white mb-6 sticky top-6">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                {isClient ? 'Freelancer' : 'Client'}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center">
                <Avatar 
                  size="lg"
                  name={isClient ? 'John Freelancer' : 'Sarah Client'}
                  src={isClient 
                    ? 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                    : 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                  }
                />
                <div className="ml-4">
                  <p className="text-md font-medium text-gray-900">
                    {isClient ? 'John Freelancer' : 'Sarah Client'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isClient ? 'Web Developer' : 'Tech Solutions Inc.'}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.934l-6.618 3.92 1.598-8.671L0 7.084l8.431-1.15L10 0l1.569 5.934L20 7.084l-4.98 4.098 1.598 8.671z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="ml-1 text-sm text-gray-500">4.8 (26 reviews)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  leftIcon={<MessageCircle size={16} />}
                  className="w-full"
                >
                  Send Message
                </Button>
              </div>
            </CardBody>
          </Card>
          
          <Card className="bg-white">
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Contract Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Contract Value</p>
                  <p className="text-xl font-bold text-gray-900">${contract.totalAmount.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Milestones</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm font-medium">{contract.milestones.filter(m => m.status === 'completed' || m.status === 'approved').length} of {contract.milestones.length}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <div className="mt-1 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Paid</span>
                      <span className="text-sm font-medium">
                        ${contract.milestones
                          .filter(m => {
                            const payment = getMilestonePayment(m.id);
                            return payment && payment.status === 'released';
                          })
                          .reduce((sum, m) => sum + m.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">In Escrow</span>
                      <span className="text-sm font-medium">
                        ${contract.milestones
                          .filter(m => {
                            const payment = getMilestonePayment(m.id);
                            return payment && payment.status === 'in_escrow';
                          })
                          .reduce((sum, m) => sum + m.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Remaining</span>
                      <span className="text-sm font-medium">
                        ${contract.milestones
                          .filter(m => {
                            const payment = getMilestonePayment(m.id);
                            return !payment || payment.status === 'pending';
                          })
                          .reduce((sum, m) => sum + m.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={getActionLabel()}
        size="md"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">{getActionDescription()}</p>
          
          {error && (
            <Alert 
              variant="error" 
              className="mb-6"
            >
              {error}
            </Alert>
          )}
          
          <div className="border rounded-md p-4 mb-6 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Milestone:</span>
              <span className="text-sm font-medium">{selectedMilestone?.title}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-medium">${selectedMilestone?.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Due Date:</span>
              <span className="text-sm font-medium">
                {selectedMilestone ? formatDate(selectedMilestone.dueDate) : ''}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button 
              variant={modalAction === 'dispute' ? 'danger' : 'primary'}
              isLoading={loading}
              onClick={handleAction}
            >
              {getActionLabel()}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractDetailPage;