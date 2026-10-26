import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 26321.
//
// Rulings:
//   [2004-10-04] Only grants the ability to creatures you control when this spell resolves. Ones
//     entering later in the turn do not get it.

export default defineCard({
  name: "Resuscitate",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: 'Until end of turn, creatures you control gain "{1}: Regenerate this creature."',
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "creature", controlledBy: "you" },
    ability: {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}: Regenerate this creature.",
    },
    duration: "end-of-turn",
  },
});
