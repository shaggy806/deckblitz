import { defineCard } from "../define.js";

// EDHREC rank 7732.
//
// Rulings:
//   [2020-11-10] Creatures that are no longer on the battlefield won't be considered for Alena's
//     mana ability, even if they entered that turn.
//   [2020-11-10] A creature you control that entered the battlefield as a noncreature permanent
//     and/or under another player's control will be counted for Alena's mana ability.
//   [2020-11-10] Alena's activated ability is a mana ability. It doesn't use the stack and can't
//     be responded to.
//
// Bighorner Rancher's greatest-power mana ability, narrowed to creatures that
// entered this turn (`enteredThisTurn` reads the permanent's own entry, so a
// creature that entered as a noncreature or under another player counts).

const MANA_TEXT =
  "{T}: Add an amount of {R} equal to the greatest power among creatures you control that entered this turn.";

export default defineCard({
  name: "Alena, Kessig Trapper",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 4,
  toughness: 3,
  keywords: ["first-strike"],
  pairing: { kind: "partner" },
  text: `First strike\n${MANA_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: {
          aggregate: "max",
          of: "power",
          filter: { type: "creature", controlledBy: "you", enteredThisTurn: true },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
