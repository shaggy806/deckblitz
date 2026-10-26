import { defineCard } from "../define.js";

// EDHREC rank 20181.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, draw three cards.";

export default defineCard({
  name: "Impaler Shrike",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Bird"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Impaler Shrike to draw three cards?",
        effect: { kind: "sacrifice-source", then: { kind: "draw", amount: 3 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
