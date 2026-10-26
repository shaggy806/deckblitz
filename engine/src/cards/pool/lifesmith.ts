import { defineCard } from "../define.js";

// EDHREC rank 30372. Urza's Chalice's shape, for your own artifact spells.

const TEXT = "Whenever you cast an artifact spell, you may pay {1}. If you do, you gain 3 life.";

export default defineCard({
  name: "Lifesmith",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to gain 3 life?",
        cost: "{1}",
        effect: { kind: "gain-life", amount: 3 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
