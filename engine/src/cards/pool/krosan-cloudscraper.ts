import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 13862.

export default defineCard({
  name: "Krosan Cloudscraper",
  manaCost: "{7}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast", "Mutant"],
  power: 13,
  toughness: 13,
  morph: { keyword: "morph", cost: "{7}{G}{G}" },
  text: "At the beginning of your upkeep, sacrifice this creature unless you pay {G}{G}.\nMorph {7}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{G}{G}", text: "Pay {G}{G}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you pay {G}{G}.",
    },
  ],
});
