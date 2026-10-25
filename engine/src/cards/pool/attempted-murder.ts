import { defineCard } from "../define.js";

// Clown Car's roll: X six-sided dice, each even result two -1/-1 counters on
// the target, each odd one a Storm Crow.
export default defineCard({
  name: "Attempted Murder",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose target creature. Roll X six-sided dice. For each even result, put two -1/-1 counters on that creature. For each odd result, create a 1/2 blue Bird creature token with flying named Storm Crow.",
  targets: ["creature"],
  effect: {
    kind: "roll-dice",
    sides: 6,
    count: "x",
    then: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "-1/-1", amount: { product: [{ roll: "even" }, 2] } },
        { kind: "create-token", token: "Storm Crow Token", count: { roll: "odd" } },
      ],
    },
  },
});
