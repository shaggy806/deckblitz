import { defineCard } from "../define.js";

// EDHREC rank 22335.

const TEXT = "Whenever enchanted creature attacks or blocks, you gain 4 life.";

export default defineCard({
  name: "Luminous Wake",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  // The Aura's ability, so its controller gains the life (the ruling); a
  // blocker triggers once however many creatures it blocks.
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: TEXT,
    },
  ],
});
