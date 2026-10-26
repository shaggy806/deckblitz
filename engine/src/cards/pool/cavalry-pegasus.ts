import { defineCard } from "../define.js";

// EDHREC rank 14307.
//
// Rulings:
//   [2013-09-15] Once the triggered ability resolves, the attacking Humans will continue to have
//     flying even if Cavalry Pegasus leaves the battlefield.
//   [2013-09-15] The attacking Humans gain flying before blockers are declared.

const ATTACK_TEXT = "Whenever this creature attacks, each attacking Human gains flying until end of turn.";

export default defineCard({
  name: "Cavalry Pegasus",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", subtype: "Human", attacking: true },
        keyword: "flying",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
