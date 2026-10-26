import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31276.

export default defineCard({
  name: "Auspicious Ancestor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: "When this creature dies, you gain 3 life.\nWhenever a player casts a white spell, you may pay {1}. If you do, you gain 1 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature dies, you gain 3 life.",
    },
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to gain 1 life?", cost: "{1}", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: "Whenever a player casts a white spell, you may pay {1}. If you do, you gain 1 life.",
    },
  ],
});
