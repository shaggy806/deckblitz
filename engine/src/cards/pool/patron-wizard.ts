import { defineCard } from "../define.js";

export default defineCard({
  name: "Patron Wizard",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Tap an untapped Wizard you control: Counter target spell unless its controller pays {1}.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Wizard", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "Tap an untapped Wizard you control: Counter target spell unless its controller pays {1}.",
    },
  ],
});
