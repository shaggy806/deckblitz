import { defineCard } from "../define.js";

// EDHREC rank 3435.

export default defineCard({
  name: "Nyxborn Hydra",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 1,
  keywords: ["reach", "trample"],
  text: "Bestow {X}{G}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nReach, trample\nThis permanent enters with X +1/+1 counters on it.\nEnchanted creature gets +1/+1 for each +1/+1 counter on this Aura and has reach and trample.",
  bestow: "{X}{G}{G}",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This permanent enters with X +1/+1 counters on it.",
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "+1/+1", pt: [1, 1] },
      grantKeywords: ["reach", "trample"],
      text: "Enchanted creature gets +1/+1 for each +1/+1 counter on this Aura and has reach and trample.",
    },
  ],
});
