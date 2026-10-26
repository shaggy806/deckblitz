import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 24050. Auspicious Ancestor's shape.

const TEXT = "Whenever a player casts a white spell, you may pay {1}. If you do, you gain 1 life.";

export default defineCard({
  name: "Apothecary Initiate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["W"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to gain 1 life?",
        cost: "{1}",
        effect: { kind: "gain-life", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
