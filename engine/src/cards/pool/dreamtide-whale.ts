import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

const PROLIFERATE_TEXT = "Whenever a player casts their second spell each turn, proliferate.";

export default defineCard({
  name: "Dreamtide Whale",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 7,
  toughness: 5,
  text: `Vanishing 2 (This creature enters with two time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${PROLIFERATE_TEXT} (Choose any number of permanents and/or players, then give each another counter of each kind already there.)`,
  static: [...vanishing(2).static],
  triggered: [
    ...vanishing(2).triggered,
    {
      trigger: { on: "cast-spell", who: "any", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
});
