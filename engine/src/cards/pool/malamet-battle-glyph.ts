import { defineCard } from "../define.js";

// EDHREC rank 15369.
//
// Rulings:
//   [2023-11-10] If the target creature you control entered the battlefield this turn and is still
//     a legal target as Malamet Battle Glyph resolves but the target creature you don't control
//     isn't, you will still put a +1/+1 counter on the creature you control. The creatures will
//     not fight each other.
//
// "You don't control" is every other player's: each of them is an opponent at
// this engine's tables (Longstalk Brawl's slot). A first target gone illegal
// gets no counter and fights nothing (rule 608.2b).

export default defineCard({
  name: "Malamet Battle Glyph",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose target creature you control and target creature you don't control. If the creature you control entered this turn, put a +1/+1 counter on it. Then those creatures fight each other.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { enteredThisTurn: true } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
