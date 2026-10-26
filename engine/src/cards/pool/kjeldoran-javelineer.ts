import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 30777.

const TAP_TEXT =
  "{T}: This creature deals damage equal to the number of age counters on it to target attacking or blocking creature.";

export default defineCard({
  name: "Kjeldoran Javelineer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: `Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "age" }, target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [cumulativeUpkeep("{1}")],
});
