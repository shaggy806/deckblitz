import { defineCard } from "../define.js";

// EDHREC rank 27990.
//
// Rulings:
//   [2021-04-16] You choose whether or not to pay 2 life as the ability resolves. Once you make
//     that choice, no one can respond before Arrogant Poet gains flying.
const ATTACK_TEXT = "Whenever this creature attacks, you may pay 2 life. If you do, it gains flying until end of turn.";

export default defineCard({
  name: "Arrogant Poet",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 2 life to give this creature flying until end of turn?",
        costLife: 2,
        effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
