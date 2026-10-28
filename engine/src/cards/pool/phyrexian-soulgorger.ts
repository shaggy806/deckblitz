import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 5978.
//
// Cumulative upkeep of a sacrifice (the `cumulativeUpkeep` helper, Polar
// Kraken's): one creature per age counter, or Phyrexian Soulgorger — which
// may itself be one of the creatures sacrificed to pay (the ruling), so the
// sacrifice isn't `exceptSource`.

export default defineCard({
  name: "Phyrexian Soulgorger",
  manaCost: "{3}",
  colors: [],
  supertypes: ["snow"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 8,
  toughness: 8,
  text: "Cumulative upkeep—Sacrifice a creature. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
  triggered: [cumulativeUpkeep({ sacrifice: { type: "creature" }, text: "Sacrifice a creature" })],
});
