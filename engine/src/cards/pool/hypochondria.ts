import { defineCard } from "../define.js";

const DISCARD_TEXT = "{W}, Discard a card: Prevent the next 3 damage that would be dealt to any target this turn.";
const SAC_TEXT = "{W}, Sacrifice this enchantment: Prevent the next 3 damage that would be dealt to any target this turn.";

export default defineCard({
  name: "Hypochondria",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${DISCARD_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false, discard: { count: 1 } },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 3 },
      resolve: null,
      text: DISCARD_TEXT,
    },
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 3 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
