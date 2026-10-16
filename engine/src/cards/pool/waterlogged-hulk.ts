import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 16641.
//
// "Craft with Island": an Island permanent you control or an Island card in
// your graveyard (rule 702.167b), whatever else it is.
export default defineCard({
  name: "Waterlogged Hulk",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  text: "{T}: Mill a card. (Put the top card of your library into your graveyard.)\nCraft with Island {3}{U} ({3}{U}, Exile this artifact, Exile an Island you control or an Island card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "{T}: Mill a card.",
    },
    craft("{3}{U}", { count: 1, filter: { subtype: "Island" }, text: "Island" }, "Craft with Island {3}{U}"),
  ],
  faces: ["Waterlogged Hulk", "Watertight Gondola"],
  transform: true,
});
