import { defineCard } from "../define.js";

const DIES_TEXT =
  "When Phyrexian Chimney Imp dies, target opponent puts two cards from their hand on top of their library in any order.";

export default defineCard({
  name: "Phyrexian Chimney Imp",
  manaCost: "{4}{B/P}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Imp"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `({B/P} can be paid with either {B} or 2 life.)\nFlying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          player: "that-player",
          min: 2,
          max: 2,
          destination: "library-top",
          leftover: "stay",
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
