import { DiagnosticDashboard } from "@/components/DiagnosticDashboard";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import heroImage from "@/assets/medical-ai-hero.jpg";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-medical-teal/90" />
        </div>
        <div className="relative z-10 text-center text-white space-y-6 px-6">
          <h1 className="text-5xl md:text-6xl font-bold">
            AI-Powered Medical Diagnostics
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl">
            Collaborative intelligence for better patient outcomes through multi-agent diagnostic workflows
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Demo Dashboard for non-authenticated users */}
      {!user && (
        <div className="py-12">
          <div className="container mx-auto px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold text-primary">
              Experience the Future of Medical Diagnostics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how our AI agents collaborate to provide comprehensive diagnostic insights. Sign up to unlock the full potential.
            </p>
          </div>
          <DiagnosticDashboard />
        </div>
      )}
    </div>
  );
};

export default Index;
