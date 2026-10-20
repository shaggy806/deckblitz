import { defineCard } from "../define.js";

// EDHREC rank 15711.
//
// Rulings:
//   [2022-02-18] The Ninjas and Rogues that gain menace are determined only once, as Kaito's
//     Pursuit resolves. A Ninja or Rogue that enters the battlefield after it resolves will not
//     have menace, and a creature that gained menace this way but then stops being a Ninja or Rogue
//     due to another effect will not lose menace.
//
// `grant-keyword-all` gives the keyword to each permanent matching as it
// resolves — a locked-in set, as the ruling says.
const TEXT =
  "Target player discards two cards. Ninjas and Rogues you control gain menace until end of turn. (They can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Kaito's Pursuit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      {
        kind: "grant-keyword-all",
        filter: { controlledBy: "you", anyOf: [{ subtype: "Ninja" }, { subtype: "Rogue" }] },
        keyword: "menace",
        duration: "end-of-turn",
      },
    ],
  },
});
