import { defineCard } from "../define.js";

export default defineCard({
  name: "Vectis Dominator",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 2,
  text: "{T}: Tap target creature unless its controller pays 2 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ payLife: 2, text: "Pay 2 life" }],
        otherwise: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: "{T}: Tap target creature unless its controller pays 2 life.",
    },
  ],
});
