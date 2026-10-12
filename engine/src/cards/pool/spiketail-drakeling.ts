import { defineCard } from "../define.js";

export default defineCard({
  name: "Spiketail Drakeling",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nSacrifice this creature: Counter target spell unless its controller pays {2}.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "Sacrifice this creature: Counter target spell unless its controller pays {2}.",
    },
  ],
});
