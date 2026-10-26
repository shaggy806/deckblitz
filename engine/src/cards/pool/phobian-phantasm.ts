import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 31532. Coldsnap.

export default defineCard({
  name: "Phobian Phantasm",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "fear"],
  text: "Flying; fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nCumulative upkeep {B} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
  triggered: [cumulativeUpkeep("{B}")],
});
