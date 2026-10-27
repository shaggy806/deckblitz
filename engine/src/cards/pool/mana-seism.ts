import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 21928. Scapeshift's choice of lands to
// sacrifice, then Last-Ditch Effort's "that much".

export default defineCard({
  name: "Mana Seism",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sacrifice any number of lands, then add that much {C}.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: { countOf: { type: "land", controlledBy: "you" } },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of lands",
      },
      { kind: "add-mana", mana: "C", amount: { thisWay: "sacrificed" } },
    ],
  },
});
