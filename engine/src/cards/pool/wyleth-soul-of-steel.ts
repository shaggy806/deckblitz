import { defineCard } from "../define.js";

// "Each Aura and Equipment attached to it": the set attached to the source,
// as it resolves — or as Wyleth last existed, if it has left (rule 608.2h).
const TEXT = "Whenever Wyleth attacks, draw a card for each Aura and Equipment attached to it.";

export default defineCard({
  name: "Wyleth, Soul of Steel",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { aggregate: "count", filter: { subtypes: ["Aura", "Equipment"] }, in: "attached-to-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
