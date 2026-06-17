import { useEffect, useState } from "react";
import axios from "axios";
import {
  Sparkles,
  Gift,
  Ribbon,
  Calendar,
  BarChart3,
  Archive,
  Star,
} from "lucide-react";

export default function Layouts() {
  const [layouts, setLayouts] = useState([]);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/layouts");
      setLayouts(res.data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const totalLayouts = layouts.length;

  const latestOccasion =
    layouts.length > 0 ? layouts[0].occasion : "No Data";

  const latestLayout =
    layouts.length > 0 ? layouts[0].layout : "No Data";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-rosegold p-8">

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm mb-6">
              <Archive className="w-4 h-4" />
              Gift Design Archive
            </div>

            <h1 className="text-5xl text-white font-extrabold font-heading mb-4">
              Layout History
            </h1>

            <p className="max-w-2xl text-white/90 text-lg">
              Browse all previously generated AI gift box recommendations,
              layouts, ribbon selections, and gifting ideas.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl">

              <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
                <p className="text-sm text-white/80">
                  Total Layouts
                </p>
                <h3 className="text-3xl font-bold">
                  {totalLayouts}
                </h3>
              </div>

              <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
                <p className="text-sm text-white/80">
                  Latest Occasion
                </p>
                <h3 className="text-xl font-bold">
                  {latestOccasion}
                </h3>
              </div>

              <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
                <p className="text-sm text-white/80">
                  Latest Layout
                </p>
                <h3 className="text-xl font-bold">
                  {latestLayout}
                </h3>
              </div>

            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm text-center">
            <BarChart3 className="mx-auto text-primary mb-3" />
            <h2 className="text-4xl font-bold">
              {totalLayouts}
            </h2>
            <p className="text-muted-foreground">
              Saved Designs
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm text-center">
            <Sparkles className="mx-auto text-primary mb-3" />
            <h2 className="text-4xl font-bold">
              100%
            </h2>
            <p className="text-muted-foreground">
              AI Generated
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm text-center">
            <Gift className="mx-auto text-primary mb-3" />
            <h2 className="text-4xl font-bold">
              {layouts.reduce(
                (sum, item) => sum + (item.products?.length || 0),
                0
              )}
            </h2>
            <p className="text-muted-foreground">
              Products Selected
            </p>
          </div>

        </div>

        {/* Empty State */}
        {layouts.length === 0 ? (
          <div className="text-center py-24">

            <Gift size={90} className="mx-auto text-primary/40" />

            <h2 className="text-3xl font-bold mt-6">
              No Gift Designs Yet
            </h2>

            <p className="text-muted-foreground mt-3">
              Create your first AI-powered gift box recommendation
              to begin building your archive.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mt-10">

            {layouts.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >

                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-rosegold p-5 text-white">

                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                      {item.occasion}
                    </h2>

                    <Sparkles />
                  </div>

                </div>

                {/* Body */}
                <div className="p-6">

                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-primary" />

                    <span className="font-semibold">
                      {item.layout}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <Ribbon className="text-primary" />

                    <span className="text-muted-foreground">
                      {item.ribbon}
                    </span>
                  </div>

                  <div className="border-t border-border pt-5">

                    <h3 className="font-bold mb-4">
                      Selected Products
                    </h3>

                    <div className="flex flex-wrap gap-2">

                      {item.products?.map((product, i) => (
                        <span
                          key={i}
                          className="bg-secondary text-foreground text-sm px-3 py-2 rounded-full"
                        >
                          🎁 {product}
                        </span>
                      ))}

                    </div>

                  </div>

                  <div className="mt-6 bg-secondary rounded-2xl p-4 flex items-center justify-center gap-2">

                    <Star className="w-4 h-4 text-primary" />

                    <span className="font-medium">
                      AI Generated Recommendation
                    </span>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}