import { defineCard } from "../define.js";

// Playtest card. A mana ability (rule 605.1a); the poison counters come with the mana.

export default defineCard({
  name: "Mox Poison",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add one mana of any color. You get two poison counters.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "add-player-counters", counter: "poison", amount: 2, who: "you" },
      },
      resolve: null,
      text: "{T}: Add one mana of any color. You get two poison counters.",
    },
  ],
});
