import { defineCard } from "../define.js";

// Rulings: every Aura on the battlefield counts, whoever controls it; blockers'
// power is checked only as blockers are declared.
export default defineCard({
  name: "Aura Gnarlid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: "Creatures with power less than this creature's power can't block it.\nThis creature gets +1/+1 for each Aura on the battlefield.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: "Creatures with power less than this creature's power can't block it.",
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each Aura on the battlefield.",
    },
  ],
});
