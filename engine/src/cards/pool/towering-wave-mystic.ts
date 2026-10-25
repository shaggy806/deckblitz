import { defineCard } from "../define.js";

// Once per damage event, "that many" the total dealt (rule 603.2c — Vessel
// of the All-Consuming's ruling): blocked by two creatures, it mills the sum
// once.
const TEXT = "Whenever this creature deals damage, target player mills that many cards.";

export default defineCard({
  name: "Towering-Wave Mystic",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
