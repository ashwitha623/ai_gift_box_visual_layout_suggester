import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Mail, Heart, Calendar, Gift, ShoppingBag, Save, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function CRMDetail() {
  const { id } = useParams(); // Selected customer ID
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  
  // Form edit states
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packStyle, setPackStyle] = useState("Luxury");

  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      if (user.role === "admin") {
        fetchAllCustomers();
      }
    }
  }, []);

  const fetchAllCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/crm/customers");
      setAllCustomers(res.data);
    } catch (err) {
      console.error("Failed to load customer list:", err);
    }
  };

  useEffect(() => {
    loadCustomerProfile();
  }, [id]);

  const loadCustomerProfile = async () => {
    try {
      setLoading(true);
      const targetId = id || 2; // Default to customer user (ID 2) if not specified in routes
      const res = await axios.get(`http://localhost:5000/api/crm/customers/${targetId}`);
      
      setCustomer(res.data);
      
      // Parse details
      const profile = res.data.profile || {};
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      
      try {
        setColors(profile.favoriteColors ? JSON.parse(profile.favoriteColors) : ["#D4AF37", "#071A3D"]);
      } catch (e) {
        setColors(["#D4AF37", "#071A3D"]);
      }

      try {
        setCategories(profile.favoriteCategories ? JSON.parse(profile.favoriteCategories) : ["Jewelry", "Premium Gifts"]);
      } catch (e) {
        setCategories(["Jewelry", "Premium Gifts"]);
      }

      setPackStyle(profile.preferredPackagingStyle || "Luxury");
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to retrieve CRM record.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    const targetId = id || 2;
    try {
      const res = await axios.put(`http://localhost:5000/api/crm/customers/${targetId}/profile`, {
        phone,
        address,
        favoriteColors: colors,
        favoriteCategories: categories,
        preferredPackagingStyle: packStyle
      });
      if (res.data.success) {
        toast({ title: "Preferences Saved", description: "Customer profile and choices updated successfully." });
        setIsEditing(false);
        loadCustomerProfile();
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header banner skeleton */}
          <div className="relative overflow-hidden rounded-[30px] bg-slate-200/80 p-8 h-40 flex items-center border">
            <div className="space-y-3 w-1/3">
              <div className="h-6 w-3/4 bg-slate-300/60 rounded" />
              <div className="h-4 w-1/2 bg-slate-300/40 rounded" />
            </div>
          </div>
          
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border rounded-3xl p-6 h-28 space-y-3">
                <div className="h-3 w-1/2 bg-slate-200/60 rounded" />
                <div className="h-6 w-1/3 bg-slate-200/80 rounded" />
              </div>
            ))}
          </div>

          {/* Columns skeleton */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border rounded-3xl p-6 h-64 space-y-4">
              <div className="h-4 w-1/3 bg-slate-200/60 rounded" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-slate-100/50 rounded" />
                <div className="h-4 w-3/4 bg-slate-100/50 rounded" />
                <div className="h-4 w-1/2 bg-slate-100/50 rounded" />
              </div>
            </div>
            <div className="bg-card border rounded-3xl p-6 h-64 space-y-4">
              <div className="h-4 w-1/3 bg-slate-200/60 rounded" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-slate-100/50 rounded" />
                <div className="h-4 w-3/4 bg-slate-100/50 rounded" />
                <div className="h-4 w-1/2 bg-slate-100/50 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background py-20 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200/80 rounded-[28px] bg-slate-50/20 max-w-md w-full space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-primary">
            <User className="w-7 h-7 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-primary font-heading">Profile Not Found</h4>
            <p className="text-xs text-muted-foreground">
              The requested customer record does not exist or has been removed.
            </p>
          </div>
          <Button onClick={() => navigate("/crm")} className="rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-semibold px-6 h-10">
            Back to CRM Calendar
          </Button>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalSpend = customer.orders?.reduce((acc, o) => acc + o.totalPrice, 0) || 0;
  const totalOrdersCount = customer.orders?.length || 0;
  const remindersCount = customer.contacts?.length || 0;

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header banner */}
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-primary to-[#050D18] p-8 text-white shadow-xl shadow-primary/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3.5 py-1 text-[10px] uppercase font-bold tracking-wider text-accent mb-4">
                <User className="w-3.5 h-3.5" /> Customer Profile Record
              </div>
              <h1 className="text-3xl font-extrabold font-heading text-white">{customer.username}</h1>
              <p className="text-slate-300 text-xs mt-1">Gifting Member Since: <strong>{new Date().toLocaleDateString()}</strong></p>
              
              {/* Customer Switcher Dropdown (Admin only) */}
              {currentUser?.role === "admin" && allCustomers.length > 0 && (
                <div className="flex items-center gap-2 mt-4 bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 w-fit">
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Select Customer:</span>
                  <select
                    value={customer.id}
                    onChange={(e) => navigate(`/crm/customer/${e.target.value}`)}
                    className="bg-transparent text-white font-bold text-xs cursor-pointer outline-none border-none pr-6 focus:ring-0"
                    style={{ colorScheme: "dark" }}
                  >
                    {allCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id} className="text-[#09152b] bg-white font-semibold">
                        {cust.username} ({cust.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Value</span>
                <span className="text-xl font-extrabold text-[#C5A880] mt-0.5 block">₹{totalSpend}</span>
              </div>
              <div className="border-l border-white/10" />
              <div className="text-center px-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orders</span>
                <span className="text-xl font-extrabold text-white mt-0.5 block">{totalOrdersCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Split layout */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Sidebar choices */}
          <div className="space-y-6">
            
            {/* Contact details */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-base border-b pb-2">Profile Details</h3>
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  <span>{phone || "No phone added"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-accent mt-0.5" />
                  <span>{address || "No delivery address stored"}</span>
                </div>
              </div>
            </div>

            {/* Custom Preferences */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-primary text-base">Gifting Choices</h3>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-accent font-bold hover:underline">
                  {isEditing ? "Cancel" : "Edit Preferences"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSavePreferences} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-primary">Phone Number</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-primary">Delivery Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-primary">Preferred Style</Label>
                    <select value={packStyle} onChange={(e) => setPackStyle(e.target.value)} className="w-full h-9 rounded-xl border px-3 text-xs bg-white">
                      <option value="Luxury">Luxury Hamper</option>
                      <option value="Romantic">Romantic Flowers</option>
                      <option value="Corporate">Corporate Engage</option>
                      <option value="Festive">Festive Splendor</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white h-9 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Preferences
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Favorite Colors</span>
                    <div className="flex gap-1.5">
                      {colors.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-full border">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                          <span className="text-[10px] text-slate-700 font-semibold">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Favorite categories</span>
                    <div className="flex flex-wrap gap-1">
                      {categories.map((cat, idx) => (
                        <Badge key={idx} className="bg-[#FAF7F2] border border-[#C5A880]/30 text-primary hover:bg-[#FAF7F2] font-semibold text-[9px]">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Packaging Style</span>
                    <strong className="text-primary block text-sm">{packStyle} Style</strong>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Customer History Section */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Occasion Reminders */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-base flex items-center gap-2 border-b pb-2">
                <Calendar className="w-5 h-5 text-accent" /> Occasions CRM Calendar ({remindersCount})
              </h3>
              
              {customer.contacts?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No dates tracked in gifting calendar.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {customer.contacts?.map(c => (
                    <div key={c.id} className="bg-secondary/15 border rounded-2xl p-3.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-primary block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{c.occasionType} · {c.relationship}</span>
                      </div>
                      <Badge className="bg-white border text-primary font-bold text-[9px]">{c.occasionDate}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gifting History Orders */}
            <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-base flex items-center gap-2 border-b pb-2">
                <ShoppingBag className="w-5 h-5 text-accent" /> Past Purchases & Gifting History
              </h3>

              {customer.orders?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No purchases recorded for this customer account.</p>
              ) : (
                <div className="space-y-3">
                  {customer.orders?.map(order => (
                    <div key={order.id} className="bg-secondary/15 rounded-2xl p-4 border flex justify-between items-center gap-2 text-xs">
                      <div>
                        <span className="font-bold text-primary block">{order.trackingId}</span>
                        <span className="text-[10px] text-slate-400">Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()} · Value: <strong>₹{order.totalPrice}</strong></span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(order.items || []).map((item, idx) => (
                            <Badge key={idx} className="bg-white border text-muted-foreground text-[8px] font-bold">
                              {item.product?.name} x{item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="bg-white border text-primary font-bold text-[9px] uppercase tracking-wider">{order.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
