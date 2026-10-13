import { defineCard } from "../define.js";

// EDHREC rank 6353.
//
// No duration (rule 611.2a). Every nonland permanent you control as it
// resolves copies the target's copiable values as they were then — what it
// copies, if it's a copy; an {X} in its cost is 0 — not its counters,
// status or attachments (rule 707.2, the rulings). Each keeps its own
// counters, status and the effects on it, and none enters, so no "enters"
// ability applies (rule 707.4). The target may be one of them.
const TEXT = "Each nonland permanent you control becomes a copy of target non-Aura permanent.";

export default defineCard({
  name: "Mirrorform",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { notSubtypes: ["Aura"] } }],
  effect: { kind: "become-copy", filter: { notTypes: ["land"], controlledBy: "you" }, of: 0 },
});
