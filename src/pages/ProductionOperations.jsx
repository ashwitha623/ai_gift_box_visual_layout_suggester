import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Users, Calendar, ClipboardList, CheckCircle, Clock, UserPlus, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const STAGES = ["Design", "Production", "Packaging", "Quality Check", "Dispatch", "Delivered"];

const COLUMN_TITLES = {
  "Design": "Pending / Design 🎨",
  "Production": "In Production 🛠️",
  "Packaging": "Hamper Packing 🎁",
  "Quality Check": "Quality Audit 🔍",
  "Dispatch": "Ready for Dispatch 🚚",
  "Delivered": "Delivered ✅"
};

const EMPLOYEES = [
  "Ankit Sharma",
  "Prakash Raj",
  "Sunita Nair",
  "Vikram Rathore",
  "Kunal Roy",
  "Sameer Sen"
];

export default function ProductionOperations() {
  const [orders, setOrders] = useState([]);
  const [stagesData, setStagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStageEdit, setSelectedStageEdit] = useState(null);
  const [editEmployee, setEditEmployee] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    loadProductionData();
  }, []);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get("http://localhost:5000/api/orders");
      const boardRes = await axios.get("http://localhost:5000/api/production/board");
      
      setOrders(ordersRes.data);
      setStagesData(boardRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load workflow data.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const orderId = draggableId;
    const targetStage = destination.droppableId;

    try {
      // Optimistic update in UI
      setStagesData(prev => {
        return prev.map(s => {
          if (s.orderId === parseInt(orderId)) {
            // Update stage statuses in memory
            const sourceIdx = STAGES.indexOf(source.droppableId);
            const destIdx = STAGES.indexOf(targetStage);
            const itemIdx = STAGES.indexOf(s.stage);

            if (itemIdx < destIdx) {
              return { ...s, status: "Completed", completionDate: s.completionDate || new Date().toISOString() };
            } else if (itemIdx === destIdx) {
              return { ...s, status: "In Progress", startDate: s.startDate || new Date().toISOString(), completionDate: null };
            } else {
              return { ...s, status: "Pending", startDate: null, completionDate: null };
            }
          }
          return s;
        });
      });

      const res = await axios.post(`http://localhost:5000/api/production/order/${orderId}/move`, { targetStage });
      if (res.data.success) {
        toast({ title: "Workflow Moved", description: `Order #${orderId} moved to ${targetStage} successfully.` });
      }
      loadProductionData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Workflow migration failed.", variant: "destructive" });
      loadProductionData();
    }
  };

  const handleSaveStageDetails = async (e) => {
    e.preventDefault();
    if (!selectedStageEdit) return;

    try {
      await axios.put(`http://localhost:5000/api/production/stage/${selectedStageEdit.id}`, {
        status: selectedStageEdit.status,
        assignedEmployee: editEmployee,
        statusNotes: editNotes
      });

      toast({ title: "Details Saved", description: "Fulfillment team parameters updated." });
      setSelectedStageEdit(null);
      loadProductionData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save details.", variant: "destructive" });
    }
  };

  // Grouping orders by active stage
  const getOrdersInStage = (stage) => {
    return orders.filter(order => {
      // Find the stage records for this order
      const orderStages = stagesData.filter(s => s.orderId === order.id);
      const activeStageRecord = orderStages.find(s => s.status === "In Progress");
      
      if (activeStageRecord) {
        return activeStageRecord.stage === stage;
      }
      
      // If none are in progress, check if all are completed (which means Delivered)
      const allCompleted = orderStages.length > 0 && orderStages.every(s => s.status === "Completed");
      if (allCompleted) {
        return stage === "Delivered";
      }

      // Default fallback: Design
      return stage === "Design";
    });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6 font-body text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-primary tracking-tight">Production Operations Board</h1>
            <p className="text-muted-foreground mt-2">Manage employee assignments per team (Design, Production, Packaging) and drag-and-drop orders across the stages.</p>
          </div>
          <Button onClick={loadProductionData} variant="outline" className="rounded-full border hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sync Board
          </Button>
        </div>

        {/* Edit Stage Form Overlay */}
        {selectedStageEdit && (
          <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
              <h3 className="text-xl font-bold font-heading text-primary mb-5">Assign Operations Details</h3>
              <form onSubmit={handleSaveStageDetails} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-primary">Assigned Employee</Label>
                  <select value={editEmployee} onChange={(e) => setEditEmployee(e.target.value)} className="w-full h-10 rounded-xl border px-3 text-xs bg-white">
                    <option value="">Unassigned</option>
                    {EMPLOYEES.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-primary">Operations Notes / Status Notes</Label>
                  <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="e.g. Ribbons checked, products placed safely." className="rounded-xl h-10 text-xs" />
                </div>
                <div className="flex gap-2.5 pt-3">
                  <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/95 text-white h-10 text-xs font-semibold flex items-center justify-center gap-1.5"><Save className="w-4 h-4" /> Save Allocation</Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedStageEdit(null)} className="rounded-xl h-10 text-xs">Cancel</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Drag and Drop Kanban Board Context */}
        {loading ? (
          <div className="text-center py-20 text-xs">Retrieving workflow stages...</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 overflow-x-auto pb-4">
              {STAGES.map(stage => {
                const stageOrders = getOrdersInStage(stage);
                
                return (
                  <div key={stage} className="bg-secondary/25 border rounded-3xl p-4 min-w-[210px] space-y-4 flex flex-col h-[650px]">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-extrabold text-primary text-xs tracking-tight">{COLUMN_TITLES[stage]}</span>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold">{stageOrders.length}</Badge>
                    </div>

                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto space-y-3 pr-1 rounded-2xl transition-colors ${
                            snapshot.isDraggingOver ? "bg-accent/5" : ""
                          }`}
                        >
                          {stageOrders.map((order, index) => {
                            const itemsCount = order.items?.length || 0;
                            const recipientName = order.recipient?.name || "Guest";
                            const activeStageObj = stagesData.find(s => s.orderId === order.id && s.stage === stage);
                            
                            return (
                              <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    className={`bg-white border rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm ${
                                      dragSnapshot.isDragging ? "shadow-xl border-accent bg-accent/5 rotate-2 scale-[1.02]" : "border-border hover:border-accent/30"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="font-extrabold text-primary text-xs block">{order.trackingId}</span>
                                      <Badge className="bg-secondary text-slate-500 text-[8px] font-bold">{order.boxSize}</Badge>
                                    </div>
                                    <div className="text-[10px] text-slate-500 space-y-1">
                                      <div>Recipient: <strong>{recipientName}</strong></div>
                                      <div>Total Price: <strong>₹{order.totalPrice}</strong></div>
                                      <div>Items: <strong>{itemsCount} selected</strong></div>
                                    </div>

                                    {/* Active employee and notes */}
                                    {activeStageObj && (
                                      <div className="bg-secondary/40 rounded-xl p-2 space-y-1.5 border border-border/40 text-[9px]">
                                        <div className="flex items-center gap-1 font-bold text-slate-600">
                                          <Users className="w-3 h-3 text-accent" />
                                          <span>{activeStageObj.assignedEmployee || "Unassigned"}</span>
                                        </div>
                                        {activeStageObj.statusNotes && (
                                          <p className="text-slate-400 italic font-medium line-clamp-1">{activeStageObj.statusNotes}</p>
                                        )}
                                        <Button
                                          size="xs"
                                          onClick={() => {
                                            setSelectedStageEdit(activeStageObj);
                                            setEditEmployee(activeStageObj.assignedEmployee || "");
                                            setEditNotes(activeStageObj.statusNotes || "");
                                          }}
                                          className="w-full rounded-lg h-5 text-[8px] font-bold bg-white text-primary border hover:bg-slate-50"
                                        >
                                          <UserPlus className="w-2.5 h-2.5 mr-0.5" /> Allocate Team
                                        </Button>
                                      </div>
                                    )}

                                    {/* Dates timestamps */}
                                    {activeStageObj?.startDate && (
                                      <div className="text-[8px] text-slate-400 flex items-center gap-0.5 mt-1">
                                        <Clock className="w-2.5 h-2.5" /> Started: {new Date(activeStageObj.startDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
