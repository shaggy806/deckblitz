import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 14045.
const TEXT = "Whenever an opponent casts a blue or black spell, you may create a 1/1 green Snake creature token.";

export default defineCard({
  name: "Snake Pit",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 green Snake creature token?",
        effect: { kind: "create-token", token: "Snake Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
