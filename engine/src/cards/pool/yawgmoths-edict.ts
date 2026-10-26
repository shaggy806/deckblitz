import { defineCard } from "../define.js";

// EDHREC rank 26115.
const TEXT = "Whenever an opponent casts a white spell, that player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Yawgmoth's Edict",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["W"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-controller", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
