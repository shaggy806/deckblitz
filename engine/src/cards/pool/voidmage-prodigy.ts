import { defineCard } from "../define.js";

export default defineCard({
  name: "Voidmage Prodigy",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{U}" },
  text: "{U}{U}, Sacrifice a Wizard: Counter target spell.\nMorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false, sacrifice: { filter: { subtype: "Wizard" } } },
      targets: ["spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{U}{U}, Sacrifice a Wizard: Counter target spell.",
    },
  ],
});
