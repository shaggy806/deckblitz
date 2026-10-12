import { defineCard } from "../define.js";

export default defineCard({
  name: "Spiketail Drake",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nSacrifice this creature: Counter target spell unless its controller pays {3}.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["spell"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: "Sacrifice this creature: Counter target spell unless its controller pays {3}.",
    },
  ],
});
