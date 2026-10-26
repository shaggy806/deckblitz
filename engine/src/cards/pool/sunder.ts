import { defineCard } from "../define.js";

// Urza's Saga.
export default defineCard({
  name: "Sunder",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return all lands to their owners' hands.",
  targets: [],
  effect: { kind: "return-to-hand-all", filter: { type: "land" } },
});
