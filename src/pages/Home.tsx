import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Create professional forms in minutes with our intuitive drag-and-drop builder.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Your data is protected with enterprise-grade security and 99.9% uptime.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Work together with your team to build and manage forms efficiently.",
    },
  ];

  const benefits = [
    "No coding required",
    "Mobile-responsive forms",
    "Real-time analytics",
    "Custom branding",
    "Export to multiple formats",
    "Integration ready",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Build Beautiful Forms
              <span className="block text-primary">In Minutes</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create stunning, responsive forms without any coding. Perfect for
              surveys, contact forms, registrations, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6"
                asChild
              >
                <Link to="/create">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent"
              >
                <Link
                  target="_blank"
                  to="https://www.loom.com/share/4b51caec70f348f9bb468ae6a6f2c0c7?sid=9291559a-bc31-4aa2-a37f-1c1a45f1d7d3"
                >
                  View Demo
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Form Builder?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and analyze forms
              effectively.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-background rounded-xl shadow-sm border hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Everything You Need in One Place
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            From simple contact forms to complex surveys, our platform provides
            all the tools you need to collect and manage data effectively.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center justify-center sm:justify-start space-x-3"
              >
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your First Form?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our platform to collect and manage
            their data.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="text-lg px-8 py-6"
            asChild
          >
            <Link to="/create">
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
