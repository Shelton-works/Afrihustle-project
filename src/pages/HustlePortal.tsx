import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MessageSquare,
  Upload,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Send,
  Download,
  Users,
  Briefcase,
} from "lucide-react";

const HustlePortal = () => {
  const { hustleId } = useParams();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [hustle, setHustle] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [milestones] = useState([
    { id: 1, title: "Initial Design Concepts", status: "completed", dueDate: "2024-01-15" },
    { id: 2, title: "First Draft Submission", status: "in_progress", dueDate: "2024-01-20" },
    { id: 3, title: "Revisions & Feedback", status: "pending", dueDate: "2024-01-25" },
    { id: 4, title: "Final Delivery", status: "pending", dueDate: "2024-01-30" },
  ]);

  useEffect(() => {
    fetchHustleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hustleId]);

  const fetchHustleData = async () => {
    try {
      const { data: hustleData } = await supabase
        .from("hustles")
        .select(`
          *,
          company_profiles!inner(*, profiles!inner(*))
        `)
        .eq("id", hustleId)
        .single();

      setHustle(hustleData);

      // Check if user has an accepted application
      const { data: appData } = await supabase
        .from("applications")
        .select("*")
        .eq("hustle_id", hustleId)
        .eq("status", "accepted")
        .single();

      if (!appData) {
        toast.error("You don't have access to this hustle portal");
        navigate("/dashboard");
        return;
      }

      setApplication(appData);
    } catch (error) {
      toast.error("Failed to fetch hustle data");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setMessages([...messages, {
        content: newMessage,
        sender_id: user?.id,
        created_at: new Date().toISOString(),
      }]);
      setNewMessage("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const progress = (completedMilestones / milestones.length) * 100;

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-accent animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (!hustle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{hustle.title}</h1>
                <p className="text-muted-foreground">
                  {userRole === "student" 
                    ? `Working with ${hustle.company_profiles?.company_name}` 
                    : `Collaborating with ${application?.student_profiles?.profiles?.full_name}`}
                </p>
              </div>
              <Badge className="text-lg px-4 py-2">Active Project</Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{hustle.duration}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-semibold">${hustle.compensation_amount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-semibold">{Math.round(progress)}%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Left</p>
                    <p className="font-semibold">12 days</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                  <h2 className="text-2xl font-semibold mb-4">Project Description</h2>
                  <p className="text-muted-foreground mb-6">{hustle.description}</p>

                  <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hustle.required_skills?.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mb-3">Project Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Completion</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Payment Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-semibold">${hustle.compensation_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-semibold text-primary">$0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="font-semibold">${hustle.compensation_amount}</span>
                      </div>
                      <Button variant="hero" className="w-full mt-4" disabled>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Request Payment
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Contact</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-semibold">{hustle.company_profiles?.company_name}</p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Project Milestones</h2>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <Card key={milestone.id} className="p-6">
                      <div className="flex items-start gap-4">
                        {getMilestoneIcon(milestone.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{milestone.title}</h3>
                            <Badge variant={
                              milestone.status === "completed" ? "default" :
                              milestone.status === "in_progress" ? "secondary" : "outline"
                            }>
                              {milestone.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Due: {milestone.dueDate}
                          </div>
                        </div>
                        {milestone.status === "in_progress" && (
                          <Button variant="hero">Mark Complete</Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Upload Deliverables</h2>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg mb-2">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <Button variant="hero">Choose Files</Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Submitted Files</h2>
                  <div className="space-y-3">
                    {[
                      { name: "Initial_Design_Concepts.pdf", date: "Jan 15, 2024", size: "2.4 MB" },
                      { name: "Brand_Guidelines.pdf", date: "Jan 14, 2024", size: "1.8 MB" },
                      { name: "Mockup_V1.fig", date: "Jan 13, 2024", size: "5.2 MB" },
                    ].map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{file.date} • {file.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Project Communication</h2>
                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                      <div className={`max-w-[70%] p-4 rounded-lg ${
                        msg.sender_id === user?.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.sender_id === user?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <Button variant="hero" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HustlePortal;
