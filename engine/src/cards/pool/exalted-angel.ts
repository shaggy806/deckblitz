import { defineCard } from "../define.js";

export default defineCard({
  name: "Exalted Angel",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{W}{W}" },
  text: "Flying\nWhenever this creature deals damage, you gain that much life.\nMorph {2}{W}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature deals damage, you gain that much life.",
    },
  ],
});
