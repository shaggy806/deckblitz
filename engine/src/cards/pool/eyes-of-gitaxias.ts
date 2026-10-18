import { defineCard } from "../define.js";

// EDHREC rank 20863. March of the Machine.

export default defineCard({
  name: "Eyes of Gitaxias",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Incubate 3. (Create an Incubator token with three +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "incubate", amount: 3 },
      { kind: "draw", amount: 1 },
    ],
  },
});
