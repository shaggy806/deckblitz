import { defineCard } from "../define.js";

// EDHREC rank 15179.
//
// Rulings:
//   [2023-04-14] Use the number of lands you control as Glistening Dawn resolves to determine the
//     value of X.
//
// Incubate X twice: two Incubator tokens, each with X +1/+1 counters. An
// Incubator isn't a land, so the first doesn't change X for the second.

const LANDS = { countOf: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "Glistening Dawn",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Incubate X twice, where X is the number of lands you control. (To incubate X, create an Incubator token with X +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "incubate", amount: LANDS },
      { kind: "incubate", amount: LANDS },
    ],
  },
});
