import { defineCard } from "../define.js";

// EDHREC rank 21916.
export default defineCard({
  name: "Rewards of Diversity",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever an opponent casts a multicolored spell, you gain 4 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "Whenever an opponent casts a multicolored spell, you gain 4 life.",
    },
  ],
});
