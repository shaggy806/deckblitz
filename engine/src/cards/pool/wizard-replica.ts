import { defineCard } from "../define.js";

export default defineCard({
  name: "Wizard Replica",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{U}, Sacrifice this creature: Counter target spell unless its controller pays {2}.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "{U}, Sacrifice this creature: Counter target spell unless its controller pays {2}.",
    },
  ],
});
