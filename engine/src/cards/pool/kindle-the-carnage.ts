import { defineCard } from "../define.js";

// EDHREC rank 25147.
// You see each discarded card and its damage before choosing to go on (the rulings); each pass is
// its own instance of damage, and creatures dealt lethal damage die together once it's done.

export default defineCard({
  name: "Kindle the Carnage",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Discard a card at random. If you do, Kindle the Carnage deals damage equal to that card's mana value to each creature. You may repeat this process any number of times.",
  effect: {
    kind: "repeat",
    mayAgain: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard", target: "you", amount: 1, random: true },
        {
          kind: "damage-all",
          filter: { type: "creature" },
          amount: { thisWay: "discarded", sumOf: "mana-value" },
        },
      ],
    },
  },
});
