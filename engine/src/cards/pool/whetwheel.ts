import { defineCard } from "../define.js";

export default defineCard({
  name: "Whetwheel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  morph: { keyword: "morph", cost: "{3}" },
  text: "{X}{X}, {T}: Target player mills X cards.\nMorph {3} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{X}{X}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: "x" },
      resolve: null,
      text: "{X}{X}, {T}: Target player mills X cards.",
    },
  ],
});
