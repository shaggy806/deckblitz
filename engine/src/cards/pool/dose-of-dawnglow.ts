import { defineCard } from "../define.js";

// EDHREC rank 16843.
//
// "If it isn't your main phase" is asked as the spell resolves, after the
// return: false only in a main phase of your own turn (Return to Dust's
// main-phase clause, negated). The blight is a choice made then, not a
// target, so the creature just returned can be the one (rule 701.68a), and
// with no creature to blight nothing happens (the ruling).
//
// Rulings:
//   [2025-11-17] If you can't place -1/-1 counters on any creatures you control (probably because
//     you control no creatures), you can't choose to blight.
//   [2025-11-17] All of the -1/-1 counters must be put on a single creature. You can't choose to
//     split them up between multiple creatures.
//   [2025-11-17] The creature you choose to put -1/-1 counters on doesn't have to have enough
//     toughness to survive the process. For example, if you blight 2, you can choose to put the
//     counters on a 1/1 creature you control.
export default defineCard({
  name: "Dose of Dawnglow",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to the battlefield. Then if it isn't your main phase, blight 2. (Put two -1/-1 counters on a creature you control.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "not",
          of: {
            kind: "all",
            of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
          },
        },
        then: { kind: "blight", amount: 2 },
      },
    ],
  },
});
