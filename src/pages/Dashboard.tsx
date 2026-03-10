import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  TrendingUp,
  MessageSquare,
  DollarSign,
  ArrowRight,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!authLoading && userRole === "company") {
      navigate("/company-dashboard");
      return;
    }
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, userRole]);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      setProfile(profileData);

      // Fetch student profile
      const { data: studentData } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      setStudentProfile(studentData);

      if (studentData) {
        // Fetch applications with hustle and company details
        const { data: appsData } = await supabase
          .from("applications")
          .select(`
            *,
            hustles (
              *,
              company_profiles (company_name, industry)
            )
          `)
          .eq("student_id", studentData.id)
          .order("applied_at", { ascending: false });

        setApplications(appsData || []);

        // Fetch payments for student's applications
        const appIds = (appsData || []).map((a: any) => a.id);
        if (appIds.length > 0) {
          const { data: paymentsData } = await supabase
            .from("payments")
            .select("*")
            .in("application_id", appIds);
          setPayments(paymentsData || []);
        }
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const totalEarnings = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingEarnings = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const acceptedApps = applications.filter((a) => a.status === "accepted");
  const pendingApps = applications.filter((a) => a.status === "pending");
  const completedApps = applications.filter((a) => a.status === "completed");

  const stats = [
    { icon: <Briefcase className="h-5 w-5" />, label: "Active Applications", value: pendingApps.length.toString(), color: "text-primary" },
    { icon: <CheckCircle2 className="h-5 w-5" />, label: "Accepted Projects", value: acceptedApps.length.toString(), color: "text-accent" },
    { icon: <DollarSign className="h-5 w-5" />, label: "Total Earnings", value: `$${totalEarnings.toFixed(0)}`, color: "text-primary" },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Completed", value: completedApps.length.toString(), color: "text-accent" },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
      pending: { className: "bg-secondary text-secondary-foreground", icon: <Clock className="h-3 w-3" />, label: "Pending" },
      accepted: { className: "bg-primary text-primary-foreground", icon: <CheckCircle2 className="h-3 w-3" />, label: "Accepted" },
      rejected: { className: "bg-destructive text-destructive-foreground", icon: <XCircle className="h-3 w-3" />, label: "Rejected" },
      completed: { className: "bg-primary text-primary-foreground", icon: <CheckCircle2 className="h-3 w-3" />, label: "Completed" },
    };
    const config = map[status] || map.pending;
    return (
      <Badge className={`gap-1 ${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const quickActions = [
    { icon: <Briefcase />, label: "Browse Hustles", link: "/hustles" },
    { icon: <FileText />, label: "Build Resume", link: "/resume" },
    { icon: <MessageSquare />, label: "Messages", link: "/messages" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || "Student"}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your hustles today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.color}`}>{stat.icon}</div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="projects">Active Projects ({acceptedApps.length})</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold">Recent Applications</h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("applications")}>
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {applications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No applications yet</p>
                          <Link to="/hustles">
                            <Button variant="hero" className="mt-4">Browse Hustles</Button>
                          </Link>
                        </div>
                      ) : (
                        applications.slice(0, 5).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-all"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{app.hustles?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {app.hustles?.company_profiles?.company_name}
                              </p>
                            </div>
                            <div className="text-right space-y-2">
                              {getStatusBadge(app.status)}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(app.applied_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div>
                  <Card className="p-6">
                    <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                      {quickActions.map((action, index) => (
                        <Link key={index} to={action.link}>
                          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                            <div className="text-primary">{action.icon}</div>
                            <span>{action.label}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 mt-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold mb-2">Boost Your Profile</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete your resume to get more views
                      </p>
                      <Link to="/resume">
                        <Button variant="hero" className="w-full">Build Resume</Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">All Applications</h2>
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">You haven't applied to any hustles yet</p>
                      <Link to="/hustles">
                        <Button variant="hero">Browse Hustles</Button>
                      </Link>
                    </div>
                  ) : (
                    applications.map((app) => (
                      <Card key={app.id} className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold">{app.hustles?.title}</h3>
                                <p className="text-muted-foreground">
                                  {app.hustles?.company_profiles?.company_name}
                                </p>
                              </div>
                              {getStatusBadge(app.status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Applied {new Date(app.applied_at).toLocaleDateString()}
                              </div>
                              {app.hustles?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {app.hustles.location}
                                </div>
                              )}
                              {app.hustles?.compensation_amount && (
                                <div className="flex items-center gap-1 text-primary font-medium">
                                  <DollarSign className="h-4 w-4" />
                                  ${app.hustles.compensation_amount}
                                </div>
                              )}
                            </div>
                            {app.cover_letter && (
                              <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                                {app.cover_letter}
                              </p>
                            )}
                          </div>
                          {app.status === "accepted" && (
                            <Link to={`/hustle-portal/${app.hustle_id}`}>
                              <Button variant="hero" size="sm">
                                Open Portal <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Active Projects Tab */}
            <TabsContent value="projects" className="mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Active Projects</h2>
                <div className="space-y-4">
                  {acceptedApps.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No active projects yet</p>
                      <p className="text-sm">Apply to hustles and get accepted to see your projects here</p>
                    </div>
                  ) : (
                    acceptedApps.map((app) => (
                      <Card key={app.id} className="p-6 border-primary/20">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">{app.hustles?.title}</h3>
                            <p className="text-muted-foreground mb-2">
                              {app.hustles?.company_profiles?.company_name}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {app.hustles?.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {app.hustles.duration}
                                </span>
                              )}
                              {app.hustles?.compensation_amount && (
                                <span className="flex items-center gap-1 text-primary font-medium">
                                  <DollarSign className="h-4 w-4" />
                                  ${app.hustles.compensation_amount}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link to={`/hustle-portal/${app.hustle_id}`}>
                            <Button variant="hero">
                              Open Portal <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Earned</span>
                  </div>
                  <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-3xl font-bold">${pendingEarnings.toFixed(2)}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Completed Jobs</span>
                  </div>
                  <p className="text-3xl font-bold">{completedApps.length}</p>
                </Card>
              </div>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Payment History</h2>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payments yet</p>
                      <p className="text-sm mt-1">Complete hustles to start earning</p>
                    </div>
                  ) : (
                    payments.map((payment) => {
                      const app = applications.find((a) => a.id === payment.application_id);
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <p className="font-semibold">{app?.hustles?.title || "Hustle"}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.completed_at
                                ? new Date(payment.completed_at).toLocaleDateString()
                                : new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${Number(payment.amount).toFixed(2)}</p>
                            <Badge className={payment.status === "completed" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
