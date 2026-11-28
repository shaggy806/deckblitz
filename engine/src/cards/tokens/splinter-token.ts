import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

/** 1/1 green Splinter with flying and cumulative upkeep {G} — Splintering
 * Wind's. No token printing of it in the Oracle snapshot. */
export default defineCard({
  name: "Splinter Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Splinter"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nCumulative upkeep {G} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
  triggered: [cumulativeUpkeep("{G}")],
});
