import { defineCard } from "../define.js";

// EDHREC rank 25702.
//
// Rulings:
//   [2011-09-22] Guardians' Pledge only gives a bonus to white creatures you control when it
//     resolves. Creatures that enter later in the turn and nonwhite creatures that become white
//     later in the turn will not get the bonus.
//
// `modify-pt-all` locks in the creatures matching as it resolves (rule 611.2c).

export default defineCard({
  name: "Guardians' Pledge",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "White creatures you control get +2/+2 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", colors: ["W"], controlledBy: "you" },
    power: 2,
    toughness: 2,
    duration: "end-of-turn",
  },
});
