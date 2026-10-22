import { defineCard } from "../define.js";

// Ice Age. A one-point prevention shield on whatever the Aura enchants as
// the ability resolves, paid for with healing counters.

export default defineCard({
  name: "Fylgja",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nThis Aura enters with four healing counters on it.\nRemove a healing counter from this Aura: Prevent the next 1 damage that would be dealt to enchanted creature this turn.\n{2}{W}: Put a healing counter on this Aura.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "healing", count: 1 } },
      targets: [],
      effect: { kind: "prevent-damage", target: "attached", amount: 1 },
      resolve: null,
      text: "Remove a healing counter from this Aura: Prevent the next 1 damage that would be dealt to enchanted creature this turn.",
    },
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "healing", amount: 1 },
      resolve: null,
      text: "{2}{W}: Put a healing counter on this Aura.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "healing", amount: 4 } },
      text: "This Aura enters with four healing counters on it.",
    },
  ],
});
