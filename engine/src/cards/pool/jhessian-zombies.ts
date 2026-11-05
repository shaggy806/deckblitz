import { defineCard } from "../define.js";

// EDHREC rank 20821.

export default defineCard({
  name: "Jhessian Zombies",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 4,
  keywords: ["fear"],
  cycling: { cost: "{2}", search: { subtype: "Island" }, name: "Islandcycling" },
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nIslandcycling {2}, swampcycling {2} ({2}, Discard this card: Search your library for an Island or Swamp card, reveal it, put it into your hand, then shuffle.)",
  moreCycling: [{ cost: "{2}", search: { subtype: "Swamp" }, name: "Swampcycling" }],
});
