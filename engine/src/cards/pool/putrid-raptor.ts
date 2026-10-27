import { defineCard } from "../define.js";

// EDHREC rank 31176.

export default defineCard({
  name: "Putrid Raptor",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Dinosaur", "Beast"],
  power: 4,
  toughness: 4,
  morph: {
    keyword: "morph",
    cost: "",
    also: { discard: { count: 1, filter: { subtype: "Zombie" } } },
    text: "Discard a Zombie card",
  },
  text: "Morph—Discard a Zombie card. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
