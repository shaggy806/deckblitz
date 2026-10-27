import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 12216. Every land, whoever controls
// it. A land that just became a creature attacks or taps only if its
// controller has controlled it since their turn began (its ruling —
// summoning sickness, rule 302.6).

export default defineCard({
  name: "Natural Affinity",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "All lands become 2/2 creatures until end of turn. They're still lands.",
  targets: [],
  effect: {
    kind: "animate-all",
    filter: { type: "land" },
    power: 2,
    toughness: 2,
    addTypes: ["creature"],
    duration: "end-of-turn",
  },
});
