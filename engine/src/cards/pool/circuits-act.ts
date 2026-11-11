import { defineCard } from "../define.js";

// EDHREC rank 8381. "For each different result": the roll's distinct numbers
// (rolling 1, 4 and 4 makes two Clown Robots; triples make one — the ruling).

export default defineCard({
  name: "Circuits Act",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Roll three six-sided dice. For each different result, create a 1/1 white Clown Robot artifact creature token.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 6,
    count: 3,
    then: { kind: "create-token", token: "Clown Robot Token", count: { roll: "distinct" } },
  },
});
