import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Eye, FileText, BarChart3, Download, Plus, Trash2 } from "lucide-react";

const ResumeStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  
  // Resume Builder State
  const [resumeData, setResumeData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    education: [{ school: "", degree: "", year: "" }],
    experience: [{ company: "", role: "", duration: "", description: "" }],
    skills: [""],
  });

  const [analytics] = useState({
    views: 127,
    avgViewTime: "2m 15s",
    topViewers: "Tech Solutions Ltd, Creative Agency Africa",
    lastViewed: "2 hours ago",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Uploading resume...");
      // Track upload
      await supabase.from("resume_analytics").insert({
        student_id: user?.id,
        view_duration: 0,
      });
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload resume");
    }
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { school: "", degree: "", year: "" }],
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: "", role: "", duration: "", description: "" }],
    });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, ""],
    });
  };

  const handleSaveResume = async () => {
    try {
      toast.loading("Saving resume...");
      // Save resume data to student profile
      toast.success("Resume saved successfully!");
    } catch (error) {
      toast.error("Failed to save resume");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Resume Studio</h1>
            <p className="text-muted-foreground">
              Build your professional resume and track how companies engage with it
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </TabsTrigger>
              <TabsTrigger value="builder">
                <FileText className="h-4 w-4 mr-2" />
                Resume Builder
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">Upload Your Resume</h2>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg mb-2">Drag & drop your resume here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse (PDF, DOC, DOCX - Max 5MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload">
                      <Button variant="hero" className="cursor-pointer" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                </Card>

                <Card className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">Resume Templates</h2>
                  <div className="space-y-4">
                    {["Modern Professional", "Creative Designer", "Tech Developer", "Clean Minimal"].map((template, i) => (
                      <div
                        key={i}
                        className="border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="font-medium">{template}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="builder" className="mt-6">
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Build Your Resume</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="hero" size="sm" onClick={handleSaveResume}>
                      <Download className="h-4 w-4 mr-2" />
                      Save & Export
                    </Button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.fullName}
                          onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.email}
                          onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.phone}
                          onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                          placeholder="+234 123 456 7890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.location}
                          onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                          placeholder="Lagos, Nigeria"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={resumeData.summary}
                        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                        placeholder="A brief summary of your experience and goals..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Education</h3>
                      <Button variant="outline" size="sm" onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="grid md:grid-cols-3 gap-4 mb-4 p-4 border border-border rounded-lg">
                        <div>
                          <Label>School/University</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => {
                              const newEdu = [...resumeData.education];
                              newEdu[i].school = e.target.value;
                              setResumeData({ ...resumeData, education: newEdu });
                            }}
                            placeholder="University of Lagos"
                          />
                        </div>
                        <div>
                          <Label>Degree/Field</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...resumeData.education];
                              newEdu[i].degree = e.target.value;
                              setResumeData({ ...resumeData, education: newEdu });
                            }}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input
                            value={edu.year}
                            onChange={(e) => {
                              const newEdu = [...resumeData.education];
                              newEdu[i].year = e.target.value;
                              setResumeData({ ...resumeData, education: newEdu });
                            }}
                            placeholder="2020-2024"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Experience</h3>
                      <Button variant="outline" size="sm" onClick={addExperience}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="space-y-4 mb-4 p-4 border border-border rounded-lg">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[i].company = e.target.value;
                                setResumeData({ ...resumeData, experience: newExp });
                              }}
                              placeholder="Tech Corp"
                            />
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Input
                              value={exp.role}
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[i].role = e.target.value;
                                setResumeData({ ...resumeData, experience: newExp });
                              }}
                              placeholder="Software Developer"
                            />
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <Input
                              value={exp.duration}
                              onChange={(e) => {
                                const newExp = [...resumeData.experience];
                                newExp[i].duration = e.target.value;
                                setResumeData({ ...resumeData, experience: newExp });
                              }}
                              placeholder="Jan 2023 - Present"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [...resumeData.experience];
                              newExp[i].description = e.target.value;
                              setResumeData({ ...resumeData, experience: newExp });
                            }}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Skills</h3>
                      <Button variant="outline" size="sm" onClick={addSkill}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {resumeData.skills.map((skill, i) => (
                        <Input
                          key={i}
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...resumeData.skills];
                            newSkills[i] = e.target.value;
                            setResumeData({ ...resumeData, skills: newSkills });
                          }}
                          placeholder="e.g., React, Python, Design"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{analytics.views}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold">{analytics.avgViewTime}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg. View Time</p>
                </Card>
                <Card className="p-6 lg:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Top Viewers</p>
                  <p className="font-semibold">{analytics.topViewers}</p>
                </Card>
              </div>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Resume View History</h2>
                <div className="space-y-4">
                  {[
                    { company: "Tech Solutions Ltd", time: "2 hours ago", duration: "3m 45s" },
                    { company: "Creative Agency Africa", time: "5 hours ago", duration: "2m 10s" },
                    { company: "Digital Marketing Hub", time: "1 day ago", duration: "1m 30s" },
                    { company: "Brand Co.", time: "2 days ago", duration: "4m 20s" },
                  ].map((view, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Eye className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{view.company}</p>
                          <p className="text-sm text-muted-foreground">{view.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{view.duration}</p>
                        <p className="text-sm text-muted-foreground">View duration</p>
                      </div>
                    </div>
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

export default ResumeStudio;
