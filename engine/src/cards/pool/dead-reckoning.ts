import { defineCard } from "../define.js";

// EDHREC rank 23024.
//
// Rulings:
//   Dead Reckoning deals damage equal to the power the creature card had while
//     it was in your graveyard (Tarmogoyf, Lord of Extinction): `with-x` reads
//     it before the card moves.
//   With the creature card no longer a legal target, it can't be put on top
//     of your library and no damage is dealt; with only the creature gone, you
//     may still put the card on top (`target-legal` on slot 0, then the `may`).
const TEXT =
  "You may put target creature card from your graveyard on top of your library. If you do, Dead Reckoning deals damage equal to that card's power to target creature.";

export default defineCard({
  name: "Dead Reckoning",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, "creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target-legal", index: 0 },
    then: {
      kind: "with-x",
      x: { powerOf: 0 },
      effect: {
        kind: "may",
        prompt: "Put the targeted creature card on top of your library?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-on-library", target: 0, position: "top" },
            { kind: "damage", amount: "x", target: 1 },
          ],
        },
      },
    },
  },
});
