import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, FileText, CreditCard, RefreshCw, Send, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { exportReportPDF } from "@/lib/exportReport";

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("recommend");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 1. AI Recommendation State
  const [recOccasion, setRecOccasion] = useState("birthday");
  const [recBudget, setRecBudget] = useState("3000");
  const [recRel, setRecRel] = useState("friend");
  const [recPref, setRecPref] = useState("");
  const [recResult, setRecResult] = useState(null);

  // 2. AI Message Generator State
  const [msgOccasion, setMsgOccasion] = useState("birthday");
  const [msgTone, setMsgTone] = useState("warm");
  const [msgRel, setMsgRel] = useState("friend");
  const [msgKeywords, setMsgKeywords] = useState("");
  const [msgResult, setMsgResult] = useState("");

  // 3. AI Card Generator State
  const [cardMessage, setCardMessage] = useState("May your day be filled with warm smiles and unforgettable milestones!");
  const [cardStyle, setCardStyle] = useState("luxury");
  const [cardDecor, setCardDecor] = useState("✨ 🪔 🌸");

  // 4. AI Corporate Proposal State
  const [corpName, setCorpName] = useState("");
  const [corpCount, setCorpCount] = useState("100");
  const [corpBudget, setCorpBudget] = useState("2500");
  const [corpOccasion, setCorpOccasion] = useState("corporate");
  const [corpResult, setCorpResult] = useState(null);
  const [corpError, setCorpError] = useState("");

  // Recommendations Handler
  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/recommend", {
        occasion: recOccasion,
        budget: recBudget,
        relationship: recRel,
        preferences: recPref
      });
      setRecResult(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Message Generator Handler
  const handleGenerateMessage = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/generate-message", {
        occasion: msgOccasion,
        tone: msgTone,
        relationship: msgRel,
        keywords: msgKeywords,
        currentMessage: msgResult
      });
      setMsgResult(res.data.message);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Card Generator Handler
  const handleGenerateCard = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/generate-card", {
        occasion: msgOccasion,
        message: cardMessage,
        themeStyle: cardStyle
      });
      setCardDecor(res.data.decorations);
      toast({ title: "Card Refreshed", description: "Visual greeting layout compiled successfully." });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Proposal Generator Handler
  const handleCorporateProposal = async () => {
    if (!corpName.trim()) {
      setCorpError("* Company Name is required.");
      return;
    }
    setCorpError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/corporate-proposal", {
        companyName: corpName,
        recipientCount: corpCount,
        targetBudget: corpBudget,
        occasion: corpOccasion
      });
      setCorpResult(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("b2b-proposal-card");
    if (!element) return;
    toast({ title: "Export Started", description: "PDF proposal is compiling." });
    try {
      await exportReportPDF(element, corpResult?.proposalTitle || "B2B Gifting Proposal");
      toast({ title: "PDF Generated", description: "Styled PDF output created successfully." });
    } catch (err) {
      console.error(err);
      toast({ title: "Export Failed", description: "Failed to generate PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">AI Gifting Assistant Center</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Harness generative intelligence to suggest perfect gift combinations, compose custom notes, generate cards, and build B2B proposals.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: "recommend", label: "Gift Advisor 🎁" },
            { id: "message", label: "Message Composer ✍️" },
            { id: "card", label: "Greeting Card Designer 🎨" },
            { id: "corporate", label: "B2B Proposal Builder 💼" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "bg-white border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB 1: GIFT ADVISOR */}
              {activeTab === "recommend" && (
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h3 className="text-2xl font-bold font-heading text-primary">AI Gift Recommender</h3>
                    <p className="text-muted-foreground text-sm">Input recipient variables to generate product groupings and color styling codes.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold text-xs text-primary">Occasion Type</Label>
                        <Select value={recOccasion} onValueChange={setRecOccasion}>
                          <SelectTrigger className="rounded-xl h-11 bg-white mt-1.5"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="birthday">Birthday</SelectItem>
                            <SelectItem value="anniversary">Anniversary</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold text-xs text-primary">Budget Cap (₹)</Label>
                          <Input type="number" value={recBudget} onChange={(e) => setRecBudget(e.target.value)} className="rounded-xl h-11 mt-1.5" />
                        </div>
                        <div>
                          <Label className="font-semibold text-xs text-primary">Relationship</Label>
                          <Select value={recRel} onValueChange={setRecRel}>
                            <SelectTrigger className="rounded-xl h-11 bg-white mt-1.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="romantic">Partner / Spouse</SelectItem>
                              <SelectItem value="colleague">Colleague</SelectItem>
                              <SelectItem value="family">Family Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="font-semibold text-xs text-primary">Preferences or Hobbies</Label>
                        <Input placeholder="e.g. coffee enthusiast, loves jewelry, vegan sweets" value={recPref} onChange={(e) => setRecPref(e.target.value)} className="rounded-xl h-11 mt-1.5" />
                      </div>

                      <Button onClick={handleRecommend} className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white h-11 shadow-md" disabled={loading}>
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />} Recommend Gifting Layout
                      </Button>
                    </div>
                  </div>

                  {/* Recommendations Display */}
                  <div className="bg-secondary rounded-3xl p-6 border border-border flex flex-col justify-between min-h-[300px]">
                    {recResult ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b pb-3 border-border">
                          <Sparkles className="text-accent w-5 h-5" />
                          <h4 className="font-extrabold text-primary text-lg font-heading">AI Recommendations</h4>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-xs text-primary uppercase tracking-wide mb-2.5">Suggested Products</h5>
                          <div className="flex flex-wrap gap-2">
                            {recResult.suggestedGifts.map((gift, i) => (
                              <Badge key={i} className="bg-white border text-primary text-xs font-semibold px-3 py-1 rounded-full">🎁 {gift}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-xs text-primary uppercase tracking-wide mb-2.5">Recommended Theme & Styling</h5>
                          <p className="text-sm font-medium text-slate-700">{recResult.suggestedThemes}</p>
                          <div className="flex gap-2 mt-3">
                            {recResult.suggestedColors.map((hex, i) => (
                              <div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border text-[10px] font-semibold text-slate-500">
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: hex }} />
                                {hex}
                              </div>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed italic border-t pt-4 border-border">
                          {recResult.explanation}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-20 my-auto text-muted-foreground">
                        <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm">Click "Recommend Gifting Layout" to generate ideas.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGE COMPOSER */}
              {activeTab === "message" && (
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h3 className="text-2xl font-bold font-heading text-primary">Personalized Message Composer</h3>
                    <p className="text-muted-foreground text-sm">Generate customized greetings in multiple tones with dynamic keywords.</p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold text-xs text-primary">Occasion</Label>
                          <Select value={msgOccasion} onValueChange={setMsgOccasion}>
                            <SelectTrigger className="rounded-xl h-11 bg-white mt-1.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="birthday">Birthday</SelectItem>
                              <SelectItem value="anniversary">Anniversary</SelectItem>
                              <SelectItem value="corporate">Corporate Appreciation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="font-semibold text-xs text-primary">Message Tone</Label>
                          <Select value={msgTone} onValueChange={setMsgTone}>
                            <SelectTrigger className="rounded-xl h-11 bg-white mt-1.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warm">Warm & Heartfelt ❤️</SelectItem>
                              <SelectItem value="formal">Elegant & Formal 👔</SelectItem>
                              <SelectItem value="playful">Playful & Fun 🎈</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="font-semibold text-xs text-primary">Relationship / Add Keywords</Label>
                        <Input placeholder="e.g. coffee, years of hard work, chocolate, laughter" value={msgKeywords} onChange={(e) => setMsgKeywords(e.target.value)} className="rounded-xl h-11 mt-1.5" />
                      </div>

                      <Button onClick={handleGenerateMessage} className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white h-11 shadow-md" disabled={loading}>
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />} Compose Greeting
                      </Button>
                    </div>
                  </div>

                  {/* Output Message */}
                  <div className="bg-secondary rounded-3xl p-6 border border-border flex flex-col justify-between min-h-[280px]">
                    {msgResult ? (
                      <div className="space-y-6 flex flex-col justify-between h-full">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-b pb-3 border-border">
                            <MessageSquare className="text-accent w-5 h-5" />
                            <h4 className="font-extrabold text-primary text-lg font-heading">AI Drafted Message</h4>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed italic bg-white p-4 rounded-2xl border border-border/50">
                            "{msgResult}"
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(msgResult); toast({ title: "Copied!", description: "Message copied to clipboard." }); }} className="rounded-full border hover:bg-white text-xs text-slate-600 font-semibold px-4 py-2">
                            Copy Message
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleGenerateMessage} className="rounded-full text-xs text-muted-foreground font-semibold px-4 py-2">
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 my-auto text-muted-foreground">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm">Click "Compose Greeting" to generate a personalized note.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: GREETING CARD DESIGNER */}
              {activeTab === "card" && (
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h3 className="text-2xl font-bold font-heading text-primary">Greeting Card Designer</h3>
                    <p className="text-muted-foreground text-sm">Select border styles and edit printable card text layouts.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold text-xs text-primary">Card Border Style</Label>
                        <Select value={cardStyle} onValueChange={setCardStyle}>
                          <SelectTrigger className="rounded-xl h-11 bg-white mt-1.5"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimalist">Minimalist Border ◼️</SelectItem>
                            <SelectItem value="luxury">Double Gold Filigree ⚜️</SelectItem>
                            <SelectItem value="floral">Soft Floral Frame 🌸</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-semibold text-xs text-primary">Card Greeting Text</Label>
                        <Textarea 
                          value={cardMessage} 
                          onChange={(e) => setCardMessage(e.target.value)} 
                          className="rounded-xl h-24 mt-1.5 bg-white"
                        />
                      </div>

                      <Button onClick={handleGenerateCard} className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white h-11 shadow-md" disabled={loading}>
                        <Sparkles className="w-4 h-4 mr-2" /> Refresh Card Preview
                      </Button>
                    </div>
                  </div>

                  {/* Printable Card Preview Card */}
                  <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-border flex items-center justify-center min-h-[300px]">
                    <div className={`w-full max-w-sm bg-white aspect-[1.5/1] flex flex-col justify-between p-6 shadow-xl transition-all duration-300 ${
                      cardStyle === "minimalist" ? "border-2 border-slate-800" :
                      cardStyle === "luxury" ? "border-[6px] border-double border-amber-500 rounded-lg" :
                      "border-8 border-pink-100 rounded-3xl"
                    }`}>
                      <div className="text-center text-sm font-semibold tracking-widest text-[#C5A880] uppercase">
                        {cardStyle === "luxury" ? "⚜️ Paper Plane Luxury ⚜️" : "Greeting"}
                      </div>
                      <p className="text-center italic text-slate-700 font-heading text-xs px-2 leading-relaxed my-auto">
                        "{cardMessage}"
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t pt-2 border-dashed">
                        <span>{cardDecor}</span>
                        <span>Designed by Paper Plane</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: B2B PROPOSAL BUILDER */}
              {activeTab === "corporate" && (
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h3 className="text-2xl font-bold font-heading text-primary">Corporate Gift Proposal Builder</h3>
                    <p className="text-muted-foreground text-sm">Generate B2B campaign recommendations, fulfillment timelines, and budget estimations.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold text-xs text-primary">Corporate Client Name</Label>
                        <Input 
                          placeholder="e.g. Google India, Deloitte" 
                          value={corpName} 
                          onChange={(e) => {
                            setCorpName(e.target.value);
                            setCorpError("");
                          }} 
                          className="rounded-xl h-11 mt-1.5" 
                        />
                        {corpError && <p className="text-xs text-rose-600 font-semibold mt-1">{corpError}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold text-xs text-primary">Quantity (No. of Boxes)</Label>
                          <Input type="number" value={corpCount} onChange={(e) => setCorpCount(e.target.value)} className="rounded-xl h-11 mt-1.5" />
                        </div>
                        <div>
                          <Label className="font-semibold text-xs text-primary">Target Box Cost (₹)</Label>
                          <Input type="number" value={corpBudget} onChange={(e) => setCorpBudget(e.target.value)} className="rounded-xl h-11 mt-1.5" />
                        </div>
                      </div>

                      <Button onClick={handleCorporateProposal} className="w-full rounded-xl bg-primary hover:bg-primary/95 text-white h-11 shadow-md" disabled={loading}>
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />} Compile Corporate Proposal
                      </Button>
                    </div>
                  </div>

                  {/* Proposal Display */}
                  <div className="bg-secondary rounded-3xl p-6 border border-border flex flex-col justify-between min-h-[350px]">
                    {corpResult ? (
                      <div className="space-y-5 text-primary">
                        <div id="b2b-proposal-card" className="space-y-5 bg-secondary p-4 rounded-2xl">
                          <div className="flex items-center justify-between border-b pb-3 border-border">
                            <h4 className="font-extrabold text-base font-heading">{corpResult.proposalTitle}</h4>
                            <Badge className="bg-primary text-white">B2B Proposal</Badge>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-bold text-xs uppercase tracking-wide">Financial Estimates</h5>
                            <p className="text-xs text-slate-700">Quantity: <strong>{corpResult.recipientCount} Hampers</strong></p>
                            <p className="text-xs text-slate-700">Cost Per Box: <strong>₹{corpResult.budgetPerBox}</strong></p>
                            <p className="text-xs text-slate-700">Total Campaign Estimate: <strong className="text-emerald-700">₹{corpResult.totalEstimate.toLocaleString("en-IN")}</strong></p>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-bold text-xs uppercase tracking-wide">Recommended Corporate Hampers</h5>
                            <div className="space-y-1.5">
                              {corpResult.recommendedHampers.map((h, i) => (
                                <div key={i} className="text-xs bg-white p-2 rounded-xl border border-border/50">
                                  <strong>{h.name}:</strong> {h.items.join(", ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 border-t pt-4 border-border">
                          <Button variant="outline" size="sm" onClick={handleExportPDF} className="rounded-full border hover:bg-white text-xs font-semibold px-4 py-2">
                            <Download className="w-3.5 h-3.5 mr-1" /> Export Proposal (PDF)
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-24 my-auto text-muted-foreground">
                        <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm">Click "Compile Corporate Proposal" to compile B2B plans.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
