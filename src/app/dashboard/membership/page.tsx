"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Check,
  Crown,
  Loader2,
  Star,
  X,
  CreditCard,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MembershipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [userMembership, setUserMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Fetch membership plans
      const { data: plansData } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true)
        .order("price");

      setPlans(plansData || []);

      // Fetch user's current membership
      const { data: membershipData } = await supabase
        .from("user_memberships")
        .select("*, membership_plans(*)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("end_date", { ascending: false })
        .limit(1)
        .single();

      setUserMembership(membershipData || null);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubscribe = async (planId: string) => {
    // In a real application, this would redirect to a payment page
    // or open a payment modal
    alert(`Redirecting to payment page for plan ${planId}`);
    // After successful payment, you would create a user_memberships record
  };

  // Mock data for demonstration
  const mockPlans = [
    {
      id: "1",
      name: "Basic",
      description: "Access to basic content and features",
      price: 9.99,
      currency: "USD",
      duration_days: 30,
      features: {
        features: [
          "Access to basic lessons",
          "Limited vocabulary practice",
          "Community forum access",
        ],
      },
    },
    {
      id: "2",
      name: "Premium",
      description: "Full access to all content and features",
      price: 19.99,
      currency: "USD",
      duration_days: 30,
      features: {
        features: [
          "Access to all lessons",
          "Unlimited vocabulary practice",
          "Community forum access",
          "Download materials",
          "Priority support",
        ],
      },
    },
    {
      id: "3",
      name: "Annual",
      description: "Full access with annual discount",
      price: 199.99,
      currency: "USD",
      duration_days: 365,
      features: {
        features: [
          "Access to all lessons",
          "Unlimited vocabulary practice",
          "Community forum access",
          "Download materials",
          "Priority support",
          "Offline access",
        ],
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Use mock data if no real data is available
  const displayPlans = plans.length > 0 ? plans : mockPlans;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Membership Plans</h1>
            <p className="text-muted-foreground">
              Choose the perfect membership plan to accelerate your language
              learning journey
            </p>
          </header>

          {/* Current Membership */}
          {userMembership && (
            <div className="mb-12 max-w-3xl mx-auto">
              <Card className="border-2 border-blue-500 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-blue-500" />
                    <span>Your Current Membership</span>
                  </CardTitle>
                  <CardDescription>
                    You are currently on the{" "}
                    {userMembership.membership_plans?.name} plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Membership Status
                      </p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Renewal Date
                      </p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                          {new Date(
                            userMembership.end_date,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Payment
                      </p>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                          {userMembership.membership_plans?.price}{" "}
                          {userMembership.membership_plans?.currency}/month
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Membership Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {displayPlans.map((plan, index) => {
              const isPopular = index === 1; // Mark the middle plan as popular
              return (
                <Card
                  key={plan.id}
                  className={`relative ${isPopular ? "border-2 border-blue-500" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                        <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="text-3xl font-bold">
                        {plan.currency} {plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          {plan.duration_days === 30 ? "/month" : "/year"}
                        </span>
                      </p>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {plan.duration_days === 30
                            ? "Monthly subscription"
                            : "Annual subscription"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features?.features?.map(
                        (feature: string, i: number) => (
                          <div key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${isPopular ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {userMembership?.membership_plans?.id === plan.id
                        ? "Current Plan"
                        : "Subscribe"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Additional Information */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Why Upgrade?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-700 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Premium Content</h3>
                <p className="text-sm text-muted-foreground">
                  Access exclusive lessons, stories, and exercises not available
                  to free users
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-700 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">No Ads</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy an ad-free learning experience with no interruptions
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-700 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Priority Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get faster responses from our language experts when you need
                  help
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2">
                  Can I cancel my subscription?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. Your access
                  will continue until the end of your billing period.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2">How do I change my plan?</h3>
                <p className="text-sm text-muted-foreground">
                  You can upgrade or downgrade your plan at any time from your
                  account settings. Changes will take effect at the start of
                  your next billing cycle.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, new users can try our Premium plan for 7 days free of
                  charge. No credit card required for the trial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
