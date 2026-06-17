import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Brain, Eye, FileText, ArrowRight, Gift, Ribbon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OCCASIONS, PRODUCTS } from "@/lib/giftdata";

const FEATURES = [
  { icon: Brain, title: "Intelligent Layout Engine", desc: "Analyzes occasion, product sizes, budget and box size to recommend the perfect arrangement style." },
  { icon: Eye, title: "Realistic Visual Preview", desc: "See your actual products arranged inside a premium gift box — layered, ribboned and presentation-ready." },
  { icon: Ribbon, title: "Ribbon & Packaging Match", desc: "Curated ribbon colors and packaging materials matched to the mood of your occasion." },
  { icon: FileText, title: "Exportable Reports", desc: "Download a polished recommendation report with match scores and arrangement instructions." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center bg-white shadow-sm border border-border rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6">
              Intelligent Gift Box Recommendation System
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight text-foreground leading-[1.08]">
              AI Gift Box Visual<br />
              <span className="bg-gradient-to-r from-primary to-rosegold bg-clip-text text-transparent">Layout Suggester</span>
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              An intelligent system that recommends the best gift box arrangement, ribbon color, packaging style, and presentation layout based on selected products and occasion.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-9">
              <Link to="/create">
                <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-rosegold text-white border-0 shadow-lg shadow-primary/30 hover:opacity-90 px-8 h-12 text-base">
                  Create Gift Box <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/layouts">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base bg-white">
                  Layout History
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero visual strip */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-16 grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-4xl mx-auto">
            {PRODUCTS.slice(0, 6).map((p, i) => (
              <div key={p.id} className={`rounded-2xl overflow-hidden shadow-lg aspect-square ${i % 2 ? "translate-y-4" : ""}`}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-center text-2xl sm:text-3xl font-bold font-heading text-foreground mb-12">From Idea to Perfect Box in 5 Steps</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["Select Occasion", "Choose Products", "Recipient Details", "Generate AI Layout", "View Report"].map((step, i) => (
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-secondary text-primary font-bold flex items-center justify-center mb-3">{i + 1}</div>
              <p className="font-semibold text-sm text-foreground">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-b from-secondary/40 to-background py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold font-heading text-foreground mb-12">Built Like a Real AI Gifting Product</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-rosegold flex items-center justify-center mb-4 shadow-md shadow-primary/20">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Occasions teaser */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">For Every Occasion</h2>
            <p className="text-muted-foreground mt-2">Ten curated occasions, each with tailored AI styling rules.</p>
          </div>
          <Link to="/create" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:gap-2 transition-all">
            Start now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {OCCASIONS.slice(0, 5).map((occ, i) => (
            <motion.div key={occ.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md">
              <img src={occ.image} alt={occ.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <p className="text-white font-semibold">{occ.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary to-rosegold p-10 sm:p-14 text-center overflow-hidden shadow-xl shadow-primary/25">
          <Gift className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10" />
          <Package className="absolute -top-8 -left-8 w-40 h-40 text-white/10" />
          <h2 className="relative text-2xl sm:text-4xl font-bold font-heading text-white">Ready to design the perfect gift box?</h2>
          <p className="relative text-white/85 mt-3 max-w-xl mx-auto">Let the AI handle the arrangement, ribbon and packaging — you just pick the gifts.</p>
          <Link to="/create" className="relative inline-block mt-7">
            <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 px-8 h-12 text-base font-semibold border-0 shadow-lg">
              Create Gift Box <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}