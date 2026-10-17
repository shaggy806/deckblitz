import { defineCard } from "../define.js";

// EDHREC rank 8790.
//
// Each of them is asked in turn order whether to scry 2; what one scries
// tells the others nothing (the ruling: they look at the same time and
// choose in turn order).

const TEXT = "Whenever players finish voting, you and each opponent who voted for a choice you voted for may scry 2.";

export default defineCard({
  name: "Model of Unity",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT}\n{T}: Add one mana of any color.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "players-finish-voting" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you-and-opponents-who-voted-with-you",
        prompt: "Scry 2?",
        effect: { kind: "scry", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
