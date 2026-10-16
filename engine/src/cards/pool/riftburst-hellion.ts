import { defineCard } from "../define.js";

// EDHREC rank 21293. Disguise (rule 702.168): cast face down for {3} it's a
// 2/2 with ward {2} and nothing else; turned face up for its disguise cost
// it's this card again, the same permanent (rule 708.8).

export default defineCard({
  name: "Riftburst Hellion",
  manaCost: "{5}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 6,
  toughness: 7,
  keywords: ["reach"],
  text:
    "Reach\nDisguise {4}{R/G}{R/G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)",
  morph: { keyword: "disguise", cost: "{4}{R/G}{R/G}" },
});
