import { defineCard } from "../define.js";

// EDHREC rank 9771.
//
// Rulings:
//   [2022-10-14] If an artifact or creature on the battlefield has {X} in its mana cost, X is 0.
//   [2022-10-14] The mana value of an artifact creature that was cast as a prototype is based on
//     the prototype mana cost rather than the card's usual mana cost.
//
// The draw reads the permanent's mana value as it is on the battlefield ({X}
// as 0, a prototype's own cost). "An opponent" isn't a target: chosen as it
// resolves (Akroan Horse's `choose-opponent`), who then gains control of it
// for good.

const TEXT =
  "Draw cards equal to the mana value of target artifact or creature you control. An opponent gains control of that permanent.";

export default defineCard({
  name: "Fateful Handoff",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { manaValueOf: 0 } },
      {
        kind: "choose-opponent",
        then: { kind: "gain-control", target: 0, who: "that-player", untilEndOfTurn: false },
      },
    ],
  },
});
