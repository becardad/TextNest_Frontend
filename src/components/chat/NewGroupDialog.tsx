import { useState } from "react";
import { X, Check, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import type { User } from "@/data/mockData";

interface NewGroupDialogProps {
  contacts: User[];
  onClose: () => void;
  onCreateGroup: (name: string, members: User[]) => void;
}

export default function NewGroupDialog({ contacts, onClose, onCreateGroup }: NewGroupDialogProps) {
  const [step, setStep] = useState<"select" | "name">("select");
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selected.length < 2) return;
    const members = contacts.filter(c => selected.includes(c.id));
    onCreateGroup(groupName.trim(), members);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              {step === "select" ? "Add Members" : "Group Details"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "select" ? (
          <>
            {/* Search */}
            <div className="px-5 pt-4 pb-2">
              <input
                type="text"
                placeholder="Search contacts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl bg-secondary/80 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-all"
              />
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="px-5 pb-2 flex flex-wrap gap-1.5">
                {selected.map(id => {
                  const c = contacts.find(x => x.id === id);
                  if (!c) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => toggleContact(id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium transition-all active:scale-95"
                    >
                      {c.name.split(" ")[0]}
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Contact list */}
            <div className="max-h-64 overflow-y-auto scrollbar-thin px-2 pb-3">
              {filtered.map(contact => {
                const isSelected = selected.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => toggleContact(contact.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 active:scale-[0.98]",
                      isSelected ? "bg-primary/5" : "hover:bg-accent/50"
                    )}
                  >
                    <UserAvatar name={contact.name} online={contact.online} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{contact.bio || "Hey there!"}</p>
                    </div>
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <div className="px-5 py-3 border-t border-border/50">
              <button
                onClick={() => selected.length >= 2 && setStep("name")}
                disabled={selected.length < 2}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                  selected.length >= 2
                    ? "gradient-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-2">
                {selected.length < 2
                  ? `Select at least 2 members (${selected.length}/2)`
                  : `${selected.length} members selected`}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Group name step */}
            <div className="px-5 pt-6 pb-4 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <input
                type="text"
                placeholder="Group name…"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                autoFocus
                maxLength={30}
                className="w-full text-center rounded-xl bg-secondary/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-all"
              />
              <p className="text-xs text-muted-foreground">
                {selected.length} members
              </p>

              {/* Member preview */}
              <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto">
                {selected.map(id => {
                  const c = contacts.find(x => x.id === id);
                  if (!c) return null;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1">
                      <UserAvatar name={c.name} size="sm" />
                      <span className="text-[10px] text-muted-foreground truncate max-w-[48px]">
                        {c.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-border/50 flex gap-2">
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-secondary text-foreground hover:bg-accent transition-all active:scale-[0.97]"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!groupName.trim()}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]",
                  groupName.trim()
                    ? "gradient-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                Create Group
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
