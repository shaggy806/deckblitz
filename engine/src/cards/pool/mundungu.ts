import { defineCard } from "../define.js";

const TEXT = "{T}: Counter target spell unless its controller pays {1} and 1 life.";

export default defineCard({
  name: "Mundungu",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", andLife: 1, text: "Pay {1} and 1 life" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
