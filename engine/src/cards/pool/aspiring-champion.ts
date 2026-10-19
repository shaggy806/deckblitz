import { defineCard } from "../define.js";

// EDHREC rank 9968.
//
// The sacrifice isn't optional (the ruling), and "if you do" is
// `sacrifice-source`'s `then`: one that already left, or that someone else
// controls now, can't be sacrificed and nothing is revealed. The card found
// enters, the rest are shuffled in, and if what entered is a Demon it deals
// damage equal to its power, as it is on the battlefield, to each opponent.
const ASCENSION_TEXT =
  "Ruinous Ascension — When this creature deals combat damage to a player, sacrifice it. If you do, reveal cards from the top of your library until you reveal a creature card. Put that card onto the battlefield, then shuffle the rest into your library. If that creature is a Demon, it deals damage equal to its power to each opponent.";

export default defineCard({
  name: "Aspiring Champion",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${ASCENSION_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "reveal-until",
          filter: { type: "creature" },
          put: "battlefield",
          rest: "shuffle",
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Demon" } },
            then: { kind: "damage", amount: { powerOf: 0 }, who: "each-opponent", from: { target: 0 } },
          },
        },
      },
      resolve: null,
      text: ASCENSION_TEXT,
    },
  ],
});
