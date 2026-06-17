import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Briefcase, Calendar, DollarSign, Sparkles, Plus, Clock, ShieldAlert, FileText, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CorporatePortal() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Enquiry Form State
  const [companyName, setCompanyName] = useState("");
  const [theme, setTheme] = useState("");
  const [budget, setBudget] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [message, setMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      if (u.role === "admin" || u.role === "corporate") {
        loadEnquiries();
      } else {
        setLoading(false);
      }
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  const loadEnquiries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/campaigns");
      setEnquiries(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    if (!companyName || !theme || !budget || !deliveryDate) {
      toast({ title: "Validation Error", description: "Please enter Company Name, Theme, Budget, and Date.", variant: "destructive" });
      return;
    }

    try {
      // Map B2B enquiry to campaign endpoint for backend compatibility
      await axios.post("http://localhost:5000/api/campaigns", {
        name: `${companyName} - ${theme}`,
        corporateId: currentUser.id || 1,
        budget: parseInt(budget),
        deliveryDate,
        employeeListUrl: message || "No extra requirements specified."
      });

      toast({ title: "Enquiry Submitted", description: "Your B2B gifting proposal request has been logged." });
      
      // Reset
      setCompanyName("");
      setTheme("");
      setBudget("");
      setDeliveryDate("");
      setMessage("");
      loadEnquiries();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit enquiry request.", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/campaigns/${id}`, { status });
      toast({ title: "Status Updated", description: `Enquiry status set to '${status}'.` });
      loadEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "corporate")) {
    return (
      <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
          <ShieldAlert className="w-16 h-16 text-rose-600 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold font-heading text-primary tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground text-sm mt-2">
            The corporate gifting enquiries portal is restricted to B2B corporate clients and administrators.
          </p>
          <Button onClick={() => window.location.href = "/auth"} className="mt-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold">
            Sign In with Corporate Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-primary to-[#050D18] p-10 text-white shadow-xl shadow-primary/10 mb-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs mb-6 text-accent uppercase font-bold tracking-wider">
              <Briefcase className="w-3.5 h-3.5" /> B2B Corporate Gifting
            </div>
            <h1 className="text-4xl font-extrabold font-heading mb-4 text-white">Corporate Enquiries & Designs</h1>
            <p className="max-w-2xl text-slate-300 text-base leading-relaxed">
              Submit proposal enquiries for B2B bulk orders, track design iterations, and manage your approvals for logo plate engravings and custom hampers.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Submit Enquiry Card */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md h-fit">
            <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 text-accent" /> Submit Gifting Enquiry
            </h2>
            <form onSubmit={handleCreateEnquiry} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Company Name</Label>
                <Input 
                  placeholder="e.g. Acme Corp" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Theme / Occasion</Label>
                <Input 
                  placeholder="e.g. Client Appreciation, Diwali Hampers" 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)} 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-xs text-primary">Budget (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 50000" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)} 
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-xs text-primary">Target Delivery Date</Label>
                  <Input 
                    type="date" 
                    value={deliveryDate} 
                    onChange={(e) => setDeliveryDate(e.target.value)} 
                    className="rounded-xl h-11 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Custom Branding & Details</Label>
                <Input 
                  placeholder="e.g. Needs gold logo print on lid" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="rounded-xl h-11"
                />
              </div>

              <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold h-11 shadow-lg shadow-primary/10">
                <Plus className="w-4 h-4 mr-2" /> Request Proposal
              </Button>
            </form>
          </div>

          {/* Submitted Enquiries Tracker */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md">
              <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2 text-primary">
                <Clock className="w-5 h-5 text-accent" /> Enquiry Status & Design Approvals
              </h2>

              {loading ? (
                <div className="text-center py-10">Loading proposals...</div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No enquiries filed yet. Fill out the request form to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq, index) => {
                    // Map statuses to clean design approval stages
                    const statusLabel = enq.status === "Scheduled" ? "Enquiry Received" :
                                        enq.status === "In Progress" ? "Design Draft Ready" :
                                        enq.status === "Completed" ? "Design Approved" : enq.status;

                    return (
                      <motion.div
                        key={enq.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-secondary rounded-2xl p-5 border border-border flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-[#C5A880]/30 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="text-primary w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-primary text-base">{enq.name}</h4>
                              <Badge className="bg-accent text-accent-foreground text-[10px] uppercase font-bold tracking-wider">
                                {statusLabel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                              <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5" /> Budget: <strong>₹{enq.budget.toLocaleString("en-IN")}</strong>
                              </span>
                              <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Target Date: <strong>{enq.deliveryDate}</strong>
                              </span>
                            </div>
                            <p className="text-slate-400 text-[10px] mt-1.5 font-medium leading-relaxed italic">
                              Requirements: "{enq.employeeListUrl || "No special requests"}"
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                          <a href="/ai-assistant">
                            <Button size="xs" variant="outline" className="rounded-full text-[10px] font-bold border h-7 bg-white hover:bg-slate-50 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-accent" /> AI Proposal
                            </Button>
                          </a>
                          {currentUser.role === "corporate" && enq.status === "In Progress" && (
                            <Button 
                              size="xs" 
                              onClick={() => handleUpdateStatus(enq.id, "Completed")}
                              className="rounded-full text-[10px] font-bold bg-primary hover:bg-primary/95 text-white h-7 shadow flex items-center gap-1"
                            >
                              <CheckSquare className="w-3 h-3" /> Approve Design
                            </Button>
                          )}
                          {currentUser.role === "admin" && enq.status === "Scheduled" && (
                            <Button 
                              size="xs" 
                              onClick={() => handleUpdateStatus(enq.id, "In Progress")}
                              className="rounded-full text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white h-7 shadow"
                            >
                              Send Design Draft
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* B2B Enquiries info card */}
            <div className="bg-[#FAF7F2] border border-border rounded-3xl p-6 shadow-sm">
              <FileText className="text-accent w-8 h-8 mb-4" />
              <h3 className="text-lg font-bold font-heading text-primary mb-1">Corporate Branding Integration</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Submit details regarding corporate packaging constraints, custom greeting text, or corporate color schemes. Our design managers will upload a draft layout for your approval within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
