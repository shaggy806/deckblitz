import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 26607. The enchantment sacrificed may be this one.

const DESTROY_TEXT = "{W}, Sacrifice an enchantment: Destroy target enchantment.";
const COUNTER_TEXT = "{3}{U}{U}: Counter target enchantment spell.";

export default defineCard({
  name: "Arenson's Aura",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${DESTROY_TEXT}\n${COUNTER_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: { filter: { type: "enchantment" } } },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [{ kind: "spell", filter: { type: "enchantment" } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
