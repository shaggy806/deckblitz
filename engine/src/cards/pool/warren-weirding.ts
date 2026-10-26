import { defineCard } from "../define.js";

// EDHREC rank 20604. Morningtide.
//
// Angrath's Rampage's sacrifice, then a this-way check on what was sacrificed
// (a changeling counts as a Goblin); the target player creates the tokens.
export default defineCard({
  name: "Warren Weirding",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["kindred", "sorcery"],
  subtypes: ["Goblin"],
  text: "Target player sacrifices a creature of their choice. If a Goblin is sacrificed this way, that player creates two 1/1 black Goblin Rogue creature tokens, and those tokens gain haste until end of turn.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", filter: { subtype: "Goblin" }, atLeast: 1 },
        then: {
          kind: "create-token",
          token: "Goblin Rogue Token",
          count: 2,
          who: "target-controller",
          gainUntilEndOfTurn: ["haste"],
        },
      },
    ],
  },
});
