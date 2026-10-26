import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 30865. Coldsnap.
//
// "Cumulative upkeep {U} or {B}": each age counter's payment may be either
// colour, which is exactly one hybrid {U/B} per counter. The graveyard
// trigger reads the age counters through last-known information.

export default defineCard({
  name: "Krovikan Whispers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nCumulative upkeep {U} or {B} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nYou control enchanted creature.\nWhen this Aura is put into a graveyard from the battlefield, you lose 2 life for each age counter on it.",
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      ...cumulativeUpkeep("{U/B}"),
      text: "Cumulative upkeep {U} or {B} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "lose-life", amount: { product: [2, { countersOn: "source", counter: "age" }] } },
      resolve: null,
      text: "When this Aura is put into a graveyard from the battlefield, you lose 2 life for each age counter on it.",
    },
  ],
});
