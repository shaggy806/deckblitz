import { defineCard } from "../define.js";

// EDHREC rank 7113.
//
// Rulings:
//   [2021-02-05] The triggered ability triggers only if the creature that has it is on the
//     battlefield as you cast your second spell. Spells you cast in a turn before that creature
//     entered the battlefield will count. In other words, the ability won’t trigger if the
//     creature with the ability is the second spell you cast during a turn or if you have already
//     cast two or more spells by the time that creature enters the battlefield that turn.
//   [2021-02-05] The triggered ability can trigger only once each turn. The ability will resolve
//     before the second spell does. It doesn’t matter if the first spell you cast that turn has
//     resolved, was countered, or is still on the stack.
//
// Jori En's "second spell each turn" trigger with Ethereal Investigator's Spirit.
const TEXT = "Whenever you cast your second spell each turn, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Clarion Spirit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
