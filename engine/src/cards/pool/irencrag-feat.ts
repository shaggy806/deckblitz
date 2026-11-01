import { defineCard } from "../define.js";

export default defineCard({
  name: "Irencrag Feat",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Add seven {R}. You can cast only one more spell this turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-mana", mana: "R", amount: 7 },
      { kind: "player-effect", duration: "end-of-turn", castsLeft: { count: 1 } },
    ],
  },
});
