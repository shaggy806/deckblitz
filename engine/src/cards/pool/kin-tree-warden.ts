import { defineCard } from "../define.js";

export default defineCard({
  name: "Kin-Tree Warden",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{G}" },
  text: "{2}: Regenerate this creature.\nMorph {G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}: Regenerate this creature.",
    },
  ],
});
