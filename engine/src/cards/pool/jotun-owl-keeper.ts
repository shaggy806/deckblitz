import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 26963.
//
// "Cumulative upkeep {W} or {U}": each age counter's payment may be either
// colour, which is one hybrid {W/U} per counter. The dies trigger counts the
// age counters through last-known information.

export default defineCard({
  name: "Jötun Owl Keeper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 3,
  text: "Cumulative upkeep {W} or {U} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nWhen this creature dies, create a 1/1 white Bird creature token with flying for each age counter on it.",
  triggered: [
    {
      ...cumulativeUpkeep("{W/U}"),
      text: "Cumulative upkeep {W} or {U} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: { countersOn: "source", counter: "age" } },
      resolve: null,
      text: "When this creature dies, create a 1/1 white Bird creature token with flying for each age counter on it.",
    },
  ],
});
