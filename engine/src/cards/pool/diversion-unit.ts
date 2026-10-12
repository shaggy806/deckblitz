import { defineCard } from "../define.js";

export default defineCard({
  name: "Diversion Unit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{U}, Sacrifice this creature: Counter target instant or sorcery spell unless its controller pays {3}.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: ["instant-or-sorcery-spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "{U}, Sacrifice this creature: Counter target instant or sorcery spell unless its controller pays {3}.",
    },
  ],
});
