import { defineCard } from "../define.js";

// EDHREC rank 18249.
//
// "You may pay {2}. If you don't, blight 2" is The Gitrog Monster's shape: an
// `unless` the controller answers, paying offered only when they can (rule
// 118.3), and blighting otherwise. Blight puts both counters on one creature
// they choose as it resolves, which needn't survive them; with no creature
// they can't blight and nothing happens (rule 701.68b — the rulings).

const ENTER_TEXT = "When this creature enters, you may pay {2}. If you don't, blight 2.";

export default defineCard({
  name: "Chaos Spewer",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 5,
  toughness: 4,
  text: `${ENTER_TEXT} (To blight 2, put two -1/-1 counters on a creature you control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}", text: "Pay {2}." }],
        otherwise: { kind: "blight", amount: 2 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
