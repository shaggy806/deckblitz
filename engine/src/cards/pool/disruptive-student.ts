import { defineCard } from "../define.js";

export default defineCard({
  name: "Disruptive Student",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: Counter target spell unless its controller pays {1}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "{T}: Counter target spell unless its controller pays {1}.",
    },
  ],
});
