import { defineCard } from "../define.js";

// EDHREC rank 23056. Disguise (rule 702.168) — see Riftburst Hellion.

export default defineCard({
  name: "Bolrac-Clan Basher",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["double-strike", "trample"],
  text:
    "Double strike, trample\nDisguise {3}{R}{R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)",
  morph: { keyword: "disguise", cost: "{3}{R}{R}" },
});
