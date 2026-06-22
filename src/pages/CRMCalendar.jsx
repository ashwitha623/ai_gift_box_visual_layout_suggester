import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, UserPlus, Bell, Gift, Sparkles, Plus, Trash2, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CRMCalendar() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New Contact Form State
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [occasionType, setOccasionType] = useState("birthday");
  const [occasionDate, setOccasionDate] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadCRM();
  }, []);

  const loadCRM = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/crm");
      setContacts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name || !occasionDate) {
      setFormError("* Please fill in the required details.");
      return;
    }
    setFormError("");

    let userId = 1;
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) userId = user.id;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      await axios.post("http://localhost:5000/api/crm", {
        userId,
        name,
        relationship: relationship || "Friend",
        occasionType,
        occasionDate
      });

      toast({ title: "Success", description: "Milestone contact added to your CRM calendar." });
      
      // Reset form
      setName("");
      setRelationship("");
      setOccasionDate("");
      loadCRM();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to add milestone contact.", variant: "destructive" });
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Feature Not Supported",
        description: "Browser notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "Thank you! You will now receive Paper Plane alerts."
        });
        return true;
      }
    }

    toast({
      title: "Notification Permission Denied",
      description: "Paper Plane requires notification access to trigger reminders. Please enable notifications in your browser settings.",
      variant: "destructive"
    });
    return false;
  };

  const handleTriggerReminder = async (id, name) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    try {
      await axios.post(`http://localhost:5000/api/crm/${id}/reminder`);
      toast({ 
        title: "Success", 
        description: "Reminder scheduled successfully. You will receive a Paper Plane browser notification at the selected time." 
      });
      // Dispatch event to refresh layout badge count instantly
      window.dispatchEvent(new Event("refresh-notifications"));
      loadCRM();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to schedule reminder.",
        variant: "destructive"
      });
    }
  };



  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Gifting Calendar & CRM</h1>
            <p className="text-muted-foreground mt-2">Manage customer profiles, relationships, and schedule milestone reminders.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-full border border-border flex items-center gap-3 shadow-sm">
            <Calendar className="text-accent w-5 h-5" />
            <span className="font-semibold text-sm text-primary">Active Milestones: {contacts.length}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Add Contact Sidebar */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md h-fit">
            <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2 text-primary">
              <UserPlus className="w-5 h-5 text-accent" /> Add Milestone Profile
            </h2>
            <form onSubmit={handleAddContact} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Contact Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. Priyah Patel" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setFormError(""); }} 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Relationship</Label>
                <Input 
                  placeholder="e.g. Sister, Client, Spouse" 
                  value={relationship} 
                  onChange={(e) => setRelationship(e.target.value)} 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Occasion Type</Label>
                <Select value={occasionType} onValueChange={setOccasionType}>
                  <SelectTrigger className="rounded-xl h-11 bg-white">
                    <SelectValue placeholder="Select Occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday 🎂</SelectItem>
                    <SelectItem value="anniversary">Anniversary 💍</SelectItem>
                    <SelectItem value="festival">Festival 🎉</SelectItem>
                    <SelectItem value="milestone">Milestone Achievement 🏆</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-xs text-primary">Milestone Date <span className="text-rose-500">*</span></Label>
                <Input 
                  type="date" 
                  value={occasionDate} 
                  onChange={(e) => { setOccasionDate(e.target.value); setFormError(""); }} 
                  className="rounded-xl h-11 bg-white"
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-semibold text-center animate-pulse">
                  {formError}
                </p>
              )}

              <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold h-11 shadow-lg shadow-primary/10">
                <Plus className="w-4 h-4 mr-2" /> Add Contact Date
              </Button>
            </form>
          </div>

          {/* CRM Calendar Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold font-heading flex items-center gap-2 text-primary">
                  <Bell className="w-5 h-5 text-accent" /> Upcoming Occasions & Reminders
                </h2>

              </div>

              {loading ? (
                <div className="text-center py-10">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No milestone dates tracked yet. Add one to see calendar reminders!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact, index) => {
                    const isBirthday = contact.occasionType === "birthday";
                    const isAnniversary = contact.occasionType === "anniversary";
                    return (
                      <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-secondary rounded-2xl p-5 border border-border flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-[#C5A880]/30 flex items-center justify-center flex-shrink-0">
                            {isBirthday ? (
                              <span className="text-xl">🎂</span>
                            ) : isAnniversary ? (
                              <span className="text-xl">💍</span>
                            ) : (
                              <span className="text-xl">🎉</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-primary text-base">{contact.name}</h4>
                              <Badge className="bg-white border text-primary text-[10px] uppercase font-bold tracking-wider">
                                {contact.relationship}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1">
                              Occasion: <span className="font-semibold text-slate-700 capitalize">{contact.occasionType}</span> on {contact.occasionDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant={contact.reminderSent ? "outline" : "default"} 
                            size="sm" 
                            onClick={() => handleTriggerReminder(contact.id, contact.name)}
                            className={`rounded-full text-xs font-semibold px-4 py-2 ${
                              contact.reminderSent ? "border-primary text-primary" : "bg-primary hover:bg-primary/95 text-white"
                            }`}
                          >
                            <Bell className="w-3.5 h-3.5 mr-1.5" />
                            {contact.reminderSent ? "Active Notification" : "Schedule Alert"}
                          </Button>
                          <Link to="/create">
                            <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold border hover:bg-white text-muted-foreground">
                              <Gift className="w-3.5 h-3.5 mr-1.5" /> Design Gift
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile Insights */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary to-[#050D18] rounded-3xl p-6 text-white shadow-lg shadow-primary/10">
                <Heart className="text-accent w-8 h-8 mb-4" />
                <h3 className="text-lg font-bold font-heading mb-1">CRM Personalization</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Store custom preferences, favorite color patterns, and packaging requests for repeat clients automatically.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#FAF7F2] to-[#EFEBE4] border border-border rounded-3xl p-6 shadow-md">
                <Award className="text-primary w-8 h-8 mb-4" />
                <h3 className="text-lg font-bold font-heading text-primary mb-1">Milestones Reminders</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paper Plane reminders are triggered automatically 5 days in advance of the milestone, providing links to launch layouts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
