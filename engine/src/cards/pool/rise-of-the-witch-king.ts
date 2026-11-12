import { defineCard } from "../define.js";

// EDHREC rank 2002.
//
// Rulings:
//   You choose which permanent card you're returning to the battlefield, if
//   any, as Rise of the Witch-king resolves, after permanents are sacrificed.
//   First the active player chooses which creature they'll sacrifice, then
//   each other player in turn order does the same, knowing choices made
//   before their choice. Then all those creatures are sacrificed
//   simultaneously.
//   You cannot return the same permanent card that you sacrificed.
// Deadly Brew's shape, to the battlefield: "another" bars only the card **you**
// sacrificed (`thisWayBy: "you"`), not one you own that an opponent
// controlled and sacrificed.
const TEXT =
  "Each player sacrifices a creature of their choice. If you sacrificed a creature this way, you may return another permanent card from your graveyard to the battlefield.";

export default defineCard({
  name: "Rise of the Witch-king",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", who: "you" },
        then: {
          kind: "may",
          prompt: "Return another permanent card from your graveyard to the battlefield?",
          effect: {
            kind: "return-from-graveyard",
            filter: { notTypes: ["instant", "sorcery"], notThisWay: "sacrificed", thisWayBy: "you" },
            destination: "battlefield",
            count: 1,
          },
        },
      },
    ],
  },
});
