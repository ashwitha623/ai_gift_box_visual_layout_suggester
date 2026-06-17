import { motion } from "framer-motion";
import { Check, Cake, Heart, GraduationCap, Gem, Sparkles, Baby, Users, Send, Briefcase, Gift } from "lucide-react";
import { OCCASIONS } from "@/lib/giftdata";

const ICONS = { Cake, Heart, GraduationCap, Gem, Sparkles, Baby, Users, Send, Briefcase, Gift };

const PALETTE = {
  birthday:     "from-pink-400/80 to-rose-600/80",
  anniversary:  "from-rose-500/80 to-red-700/80",
  graduation:   "from-amber-400/80 to-yellow-600/80",
  wedding:      "from-slate-300/80 to-slate-500/80",
  festival:     "from-orange-400/80 to-red-500/80",
  baby_shower:  "from-pink-300/80 to-fuchsia-400/80",
  friendship:   "from-violet-400/80 to-purple-600/80",
  farewell:     "from-sky-400/80 to-blue-600/80",
  corporate:    "from-slate-400/80 to-gray-600/80",
  just_because: "from-rose-300/80 to-pink-500/80",
};

export default function OccasionStep({ selected, onSelect }) {
  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground mb-2 tracking-tight">
          What's the Occasion?
        </h2>
        <p className="text-muted-foreground text-base">
          The AI uses your occasion to tailor the ribbon color, layout style, and packaging material.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {OCCASIONS.map((occ, i) => {
          const Icon = ICONS[occ.icon] || Gift;
          const isSelected = selected?.id === occ.id;
          const gradient = PALETTE[occ.id] || "from-rose-400/80 to-pink-600/80";

          return (
            <motion.button
              key={occ.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 22 }}
              onClick={() => onSelect(occ)}
              className={`group relative text-left rounded-3xl overflow-hidden bg-card transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "ring-[3px] ring-primary shadow-2xl shadow-primary/30 scale-[1.04]"
                  : "shadow-lg hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1"
              }`}
            >
              {/* Image */}
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.parentElement.style.background = "#f5d8e2"; e.currentTarget.style.display = "none"; }}
                />
                {/* Rich gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Icon pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-lg">
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-bold text-foreground">{occ.title}</span>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </motion.div>
                )}
              </div>

              {/* Description */}
              <div className="p-4 pb-5">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{occ.description}</p>
              </div>

              {/* Selected bottom bar */}
              {isSelected && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-rosegold rounded-b-3xl" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}