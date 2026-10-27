import { defineCard } from "../define.js";

// EDHREC rank 30748.

export default defineCard({
  name: "Raven Guild Initiate",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 4,
  morph: {
    keyword: "morph",
    cost: "",
    also: { returnToHand: { count: 1, filter: { subtype: "Bird" } } },
    text: "Return a Bird you control to its owner's hand",
  },
  text: "Morph—Return a Bird you control to its owner's hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
