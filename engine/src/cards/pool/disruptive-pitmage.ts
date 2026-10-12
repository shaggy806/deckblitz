import { defineCard } from "../define.js";

export default defineCard({
  name: "Disruptive Pitmage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{U}" },
  text: "{T}: Counter target spell unless its controller pays {1}.\nMorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
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
