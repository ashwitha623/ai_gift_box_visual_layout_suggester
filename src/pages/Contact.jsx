import { useState, useEffect } from "react";
import { Mail, User, BookOpen, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("contact-form-container");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name.trim()) newErrors.name = "* Name is required.";
    if (!email.trim()) newErrors.email = "* Email address is required.";
    if (!subject.trim()) newErrors.subject = "* Subject is required.";
    if (!message.trim()) newErrors.message = "* Message is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for reaching out. We will contact you soon.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background flex flex-col items-center justify-center p-6 py-16">
      <div id="contact-form-container" className="w-full max-w-2xl bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-heading text-primary tracking-tight">Contact Us</h1>
            <p className="text-muted-foreground text-sm mt-3">
              Fill out the form below, you will be contacted soon
            </p>
            <p className="text-xs text-rose-500 font-medium mt-1">
              * Required fields
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-primary">Name *</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors(prev => ({ ...prev, name: "" }));
                    }}
                    className="pl-10 rounded-xl h-11 bg-background"
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-primary">Email address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: "" }));
                    }}
                    className="pl-10 rounded-xl h-11 bg-background"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs text-primary">Subject *</Label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setErrors(prev => ({ ...prev, subject: "" }));
                  }}
                  className="pl-10 rounded-xl h-11 bg-background"
                />
              </div>
              {errors.subject && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.subject}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs text-primary">Message *</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Textarea
                  placeholder="Message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setErrors(prev => ({ ...prev, message: "" }));
                  }}
                  className="pl-10 rounded-xl min-h-[160px] bg-background pt-3"
                />
              </div>
              {errors.message && <p className="text-xs text-rose-600 font-semibold mt-1">{errors.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold h-11 mt-4 shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
