import React from 'react';
import { DiagnosticDashboard } from '@/components/DiagnosticDashboard';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light via-background to-medical-light/50">
      <Navigation />
      
      {/* Header */}
      <div className="pt-20 pb-8 px-6">
        <div className="container mx-auto">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personalized medical AI diagnostic dashboard is ready to help you analyze patient cases and collaborate with AI agents.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <DiagnosticDashboard />
    </div>
  );
};

export default Dashboard;