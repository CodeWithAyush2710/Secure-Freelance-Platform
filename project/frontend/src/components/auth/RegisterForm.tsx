import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onToggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');
  const [formError, setFormError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!walletAddress) {
      setFormError('Please enter your wallet address');
      return;
    }

    try {
      await register(email, password, name, role, walletAddress);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error will be handled by the AuthContext
    }
  };

  return (
    <div className="w-full max-w-md">
      <form className="bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create your account</h2>
        
        {(error || formError) && (
          <Alert 
            variant="error" 
            className="mb-4"
          >
            {error || formError}
          </Alert>
        )}
        
        <Input
          label="Full Name"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          leftIcon={<User className="h-5 w-5" />}
          autoComplete="name"
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<Mail className="h-5 w-5" />}
          autoComplete="email"
          required
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          helperText="Must be at least 6 characters"
          required
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          required
        />
        
        <Input
          label="Wallet Address"
          type="text"
          id="walletAddress"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          leftIcon={<Briefcase className="h-5 w-5" />}
          required
        />
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            I am a:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="freelancer"
                checked={role === 'freelancer'}
                onChange={() => setRole('freelancer')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Freelancer</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === 'client'}
                onChange={() => setRole('client')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Client</span>
            </label>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Create Account
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={onToggleForm}
            >
              Log in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;