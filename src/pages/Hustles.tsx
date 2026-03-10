import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign,
  Filter
} from "lucide-react";

const Hustles = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const hustles = [
    {
      id: 1,
      title: "Social Media Content Creator",
      company: "Digital Marketing Hub",
      location: "Lagos, Nigeria",
      type: "Part-time",
      payment: "$200-300",
      duration: "2 weeks",
      description: "Create engaging social media content for brand awareness campaign targeting Nigerian youth.",
      tags: ["Marketing", "Social Media", "Content Creation"],
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Mobile App Tester",
      company: "Tech Solutions Ltd",
      location: "Nairobi, Kenya",
      type: "Project-based",
      payment: "$150",
      duration: "1 week",
      description: "Test new fintech app and provide detailed feedback on user experience and bugs.",
      tags: ["Testing", "Mobile", "QA"],
      posted: "3 days ago",
    },
    {
      id: 3,
      title: "Graphic Designer for Campaign",
      company: "Creative Agency Africa",
      location: "Accra, Ghana",
      type: "Freelance",
      payment: "$400-500",
      duration: "3 weeks",
      description: "Design visual assets for pan-African brand campaign including posters, social graphics, and merchandise.",
      tags: ["Design", "Graphics", "Branding"],
      posted: "5 days ago",
    },
    {
      id: 4,
      title: "Data Entry Specialist",
      company: "Research Institute",
      location: "Remote",
      type: "Part-time",
      payment: "$100-150",
      duration: "2 weeks",
      description: "Input survey data into database system. Attention to detail required.",
      tags: ["Data Entry", "Admin", "Remote"],
      posted: "1 week ago",
    },
    {
      id: 5,
      title: "Video Editor",
      company: "Media Production Co",
      location: "Johannesburg, South Africa",
      type: "Project-based",
      payment: "$350",
      duration: "10 days",
      description: "Edit promotional videos for startup launch. Experience with Adobe Premiere preferred.",
      tags: ["Video", "Editing", "Creative"],
      posted: "4 days ago",
    },
    {
      id: 6,
      title: "Translation Services (English-French)",
      company: "International NGO",
      location: "Remote",
      type: "Freelance",
      payment: "$200",
      duration: "1 week",
      description: "Translate educational materials from English to French for West African distribution.",
      tags: ["Translation", "Languages", "Remote"],
      posted: "6 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Find Your Next Hustle</h1>
            <p className="text-muted-foreground">
              Browse {hustles.length} opportunities from verified companies across Africa
            </p>
          </div>

          {/* Search and Filter */}
          <Card className="p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hustles, companies, or skills..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select className="h-10 px-3 rounded-md border border-input bg-background">
                <option value="">All Locations</option>
                <option value="nigeria">Nigeria</option>
                <option value="kenya">Kenya</option>
                <option value="ghana">Ghana</option>
                <option value="south-africa">South Africa</option>
                <option value="remote">Remote</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </Card>

          {/* Hustles Grid */}
          <div className="grid gap-6">
            {hustles.map((hustle) => (
              <Card key={hustle.id} className="p-6 hover:shadow-[var(--shadow-card)] transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{hustle.title}</h3>
                        <p className="text-muted-foreground">{hustle.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {hustle.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {hustle.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {hustle.duration}
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <DollarSign className="h-4 w-4" />
                        {hustle.payment}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{hustle.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {hustle.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:ml-6 lg:min-w-[200px]">
                    <Button variant="hero" className="w-full">
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Save for Later
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Posted {hustle.posted}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More Hustles
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hustles;