import { defineCard } from "../define.js";

// EDHREC rank 28552. Every opponent's red spell (the ruling).

export default defineCard({
  name: "Warmth",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever an opponent casts a red spell, you gain 2 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever an opponent casts a red spell, you gain 2 life.",
    },
  ],
});
