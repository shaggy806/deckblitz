import { defineCard } from "../define.js";

// EDHREC rank 18028.
//
// Rulings:
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn't
//     interact with flying or reach.
//   [2009-10-01] You can't activate Xiahou Dun's ability to return Xiahou Dun itself to your hand.
//     You must choose a target before you sacrifice Xiahou Dun, so it's not a black card in your
//     graveyard yet.
//   [2013-09-20] If a turn has multiple combat phases, the ability can only be activated before
//     the beginning of the declare attackers step of the first combat phase in that turn.

export default defineCard({
  name: "Xiahou Dun, the One-Eyed",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nSacrifice Xiahou Dun: Return target black card from your graveyard to your hand. Activate only during your turn, before attackers are declared.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      // "Before attackers are declared": the upkeep, draw step, first main
      // phase and the first combat's beginning step (Talas Researcher).
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          {
            kind: "any",
            of: [
              { kind: "turn-structure", steps: ["upkeep", "draw"] },
              { kind: "turn-structure", mainPhase: 1 },
              { kind: "turn-structure", steps: ["begin-combat"], combatPhase: 1 },
            ],
          },
        ],
      },
      // The target is chosen before the sacrifice, so never Xiahou Dun itself.
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { colors: ["B"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "Sacrifice Xiahou Dun: Return target black card from your graveyard to your hand. Activate only during your turn, before attackers are declared.",
    },
  ],
});
