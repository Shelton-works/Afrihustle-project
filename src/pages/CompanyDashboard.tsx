import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from "lucide-react";

const CompanyDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [applications, setApplications] = useState<any[]>([]);
  const [hustles, setHustles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (userRole !== "company") {
      navigate("/dashboard");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const fetchData = async () => {
    try {
      // Fetch company profile
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (companyProfile) {
        // Fetch hustles
        const { data: hustlesData } = await supabase
          .from("hustles")
          .select("*")
          .eq("company_id", companyProfile.id)
          .order("created_at", { ascending: false });

        setHustles(hustlesData || []);

        // Fetch applications for company hustles
        const { data: appsData } = await supabase
          .from("applications")
          .select(`
            *,
            hustles!inner(*),
            student_profiles!inner(*, profiles!inner(*))
          `)
          .in(
            "hustle_id",
            hustlesData?.map((h) => h.id) || []
          )
          .order("applied_at", { ascending: false });

        setApplications(appsData || []);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: "pending" | "accepted" | "rejected") => {
    try {
      await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);

      toast.success(`Application ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update application");
    }
  };

  const stats = [
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "Active Hustles",
      value: hustles.filter((h) => h.status === "open").length.toString(),
      color: "text-primary",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Total Applications",
      value: applications.length.toString(),
      color: "text-accent",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Total Views",
      value: hustles.reduce((sum, h) => sum + (h.views || 0), 0).toString(),
      color: "text-primary",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Conversion Rate",
      value: applications.length > 0
        ? `${Math.round((applications.filter((a) => a.status === "accepted").length / applications.length) * 100)}%`
        : "0%",
      color: "text-accent",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; icon: any; label: string }> = {
      pending: { className: "bg-secondary text-secondary-foreground", icon: <Clock className="h-3 w-3" />, label: "Pending" },
      accepted: { className: "bg-primary text-primary-foreground", icon: <CheckCircle2 className="h-3 w-3" />, label: "Accepted" },
      rejected: { className: "bg-destructive text-destructive-foreground", icon: <XCircle className="h-3 w-3" />, label: "Rejected" },
      completed: { className: "bg-primary text-primary-foreground", icon: <CheckCircle2 className="h-3 w-3" />, label: "Completed" },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <Badge className={`gap-1 ${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.student_profiles?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.hustles?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Company Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your hustles and review applications
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="hustles">My Hustles ({hustles.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Recent Applications</h2>
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">
                            {app.student_profiles?.profiles?.full_name || "Anonymous"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {app.hustles?.title}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Hustle Performance</h2>
                  <div className="space-y-4">
                    {hustles.slice(0, 5).map((hustle) => (
                      <div key={hustle.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{hustle.title}</p>
                          <Badge>{hustle.status}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {hustle.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {applications.filter((a) => a.hustle_id === hustle.id).length} applicants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applicants..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <Card key={app.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {app.student_profiles?.profiles?.full_name || "Anonymous"}
                              </h3>
                              <p className="text-muted-foreground">
                                Applied for: {app.hustles?.title}
                              </p>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Applied {new Date(app.applied_at).toLocaleDateString()}
                            </div>
                            {app.student_profiles?.university && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {app.student_profiles.university}
                              </div>
                            )}
                          </div>

                          {app.cover_letter && (
                            <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                              <p className="text-sm">{app.cover_letter}</p>
                            </div>
                          )}

                          {app.student_profiles?.skills && (
                            <div className="flex flex-wrap gap-2">
                              {app.student_profiles.skills.map((skill: string, i: number) => (
                                <Badge key={i} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                          <div className="flex flex-col gap-2 lg:min-w-[200px]">
                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="hero"
                                onClick={() => updateApplicationStatus(app.id, "accepted")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => updateApplicationStatus(app.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download CV
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="hustles" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Your Hustles</h2>
                  <Button variant="hero">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post New Hustle
                  </Button>
                </div>

                <div className="space-y-4">
                  {hustles.map((hustle) => (
                    <Card key={hustle.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{hustle.title}</h3>
                            <Badge>{hustle.status}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{hustle.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {hustle.views || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {applications.filter((a) => a.hustle_id === hustle.id).length} applications
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {applications.filter((a) => a.hustle_id === hustle.id && a.status === "accepted").length} accepted
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Close</Button>
                        </div>
                      </div>

                      {hustle.required_skills && (
                        <div className="flex flex-wrap gap-2">
                          {hustle.required_skills.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
