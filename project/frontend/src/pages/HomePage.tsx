import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, TrendingUp, Briefcase } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      setShowRegisterForm(true);
    }
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setShowRegisterForm(!showRegisterForm);
  };

  const closeForm = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Hero section */}
      <div className="relative pt-6 pb-16 sm:pb-24">
        <main className="mt-16 sm:mt-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-center mb-6">
              <img src="/contractchain-logo.svg" alt="ContractChain Logo" className="h-16 w-16" />
            </div>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                <div>
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-5xl lg:mt-6 xl:text-6xl">
                    <span className="block">Secure contracts for</span>
                    <span className="block text-blue-800">freelancers and clients</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Our platform provides secure, transparent contract management and milestone-based payments that protect both freelancers and clients throughout the project lifecycle.
                  </p>
                  <div className="mt-8 sm:mt-12">
                    <div className="inline-flex items-center divide-x divide-gray-300">
                      <div className="flex-shrink-0 flex pr-5">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-800 text-white">
                          <Shield className="h-6 w-6" />
                        </div>
                        <div className="ml-4 text-base font-medium text-gray-900">
                          Secure Escrow
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex px-5">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-600 text-white">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div className="ml-4 text-base font-medium text-gray-900">
                          Milestone Tracking
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Button
                        onClick={handleGetStarted}
                        size="lg"
                      >
                        Get started
                      </Button>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowLoginForm(true)}
                      >
                        Log in
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
                <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
                  {showLoginForm && (
                    <LoginForm onSuccess={handleAuthSuccess} onToggleForm={toggleForm} />
                  )}
                  
                  {showRegisterForm && (
                    <RegisterForm onSuccess={handleAuthSuccess} onToggleForm={toggleForm} />
                  )}
                  
                  {!showLoginForm && !showRegisterForm && (
                    <div className="px-4 py-8 sm:px-10">
                      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                          alt="Freelancer and client working together" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why choose SecureFreelance?
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Our platform is designed to make freelancing secure, transparent, and stress-free for both parties.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-20 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                For Freelancers
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Get paid on time, every time. Our platform ensures your work is protected and payment is guaranteed upon completion of agreed-upon milestones.
              </p>

              <dl className="mt-10 space-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-800 text-white">
                      <Shield className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Payment Protection</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Funds are securely held in escrow until you deliver, ensuring you always get paid for completed work.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-800 text-white">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Clear Contracts</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    All projects have detailed contracts with clear deliverables, deadlines, and payment terms.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-800 text-white">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Career Growth</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Build your reputation with verified reviews and ratings from satisfied clients.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0" aria-hidden="true">
              <img
                className="relative mx-auto rounded-lg shadow-lg"
                src="https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Freelancer working"
              />
            </div>
          </div>

          <div className="relative mt-12 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                  For Clients
                </h3>
                <p className="mt-3 text-lg text-gray-500">
                  Find reliable freelancers and manage projects with confidence. Only pay for work that meets your standards.
                </p>

                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-teal-600 text-white">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Quality Assurance</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      Review and approve work before funds are released to ensure quality meets your expectations.
                    </dd>
                  </div>

                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-teal-600 text-white">
                        <Shield className="h-6 w-6" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Budget Control</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      Set clear milestone-based payments and only release funds when deliverables are approved.
                    </dd>
                  </div>

                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-teal-600 text-white">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Dispute Resolution</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      Our platform includes a fair dispute resolution process if disagreements arise.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-10 -mx-4 relative lg:mt-0 lg:col-start-1">
                <img
                  className="relative mx-auto rounded-lg shadow-lg"
                  src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Client working with team"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-12 px-6 bg-blue-800 rounded-3xl overflow-hidden shadow-xl sm:px-12 sm:py-16">
            <div className="relative lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                  What our users are saying
                </h2>
                <div className="mt-6 max-w-xl text-lg text-blue-100">
                  <p>
                    "SecureFreelance revolutionized my freelance business. The milestone payments gave me security, and the clear contracts prevented misunderstandings. I've doubled my clients since joining."
                  </p>
                </div>
                <div className="mt-4 text-blue-100">
                  <p className="font-medium">- Alex Johnson, Web Developer</p>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-1">
                <div className="text-lg text-blue-100 mt-6">
                  <p>
                    "As a startup founder, finding reliable freelancers was a challenge until I found SecureFreelance. The escrow system protects our budget, and the milestone tracking keeps projects on schedule."
                  </p>
                </div>
                <div className="mt-4 text-blue-100">
                  <p className="font-medium">- Maria Chen, Tech Entrepreneur</p>
                </div>
                <div className="mt-12">
                  <Button
                    variant="primary"
                    className="bg-white text-blue-800 hover:bg-blue-50"
                    onClick={handleGetStarted}
                  >
                    Join them today
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;