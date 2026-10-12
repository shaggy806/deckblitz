import { defineCard } from "../define.js";

export default defineCard({
  name: "Spiketail Hatchling",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nSacrifice this creature: Counter target spell unless its controller pays {1}.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "Sacrifice this creature: Counter target spell unless its controller pays {1}.",
    },
  ],
});
