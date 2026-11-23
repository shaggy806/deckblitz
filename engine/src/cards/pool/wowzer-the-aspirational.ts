import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). An intervening-if (rule 603.4), checked
// as it attacks and again as it resolves: at least one energy counter, one of
// each of the six artifact subtypes, the monarch, the city's blessing and the
// initiative, all its controller's.

const TEXT =
  "Whenever Wowzer, the Aspirational attacks, if you have an {E}, control a Blood, a Clue, a Food, a Map, a Powerstone, and a Treasure, are the monarch, and have the city's blessing and the initiative, you win the game.";

const CONTROLS = ["Blood", "Clue", "Food", "Map", "Powerstone", "Treasure"].map((subtype) => ({
  kind: "controls" as const,
  filter: { subtype },
  atLeast: 1,
}));

export default defineCard({
  name: "Wowzer, the Aspirational",
  manaCost: "{C}{W}{U}{B}{R}{G}{S}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary", "snow"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 10,
  toughness: 10,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "player-counters", counter: "energy", who: "you", atLeast: 1 },
          ...CONTROLS,
          { kind: "monarch", who: "you" },
          { kind: "citys-blessing" },
          { kind: "initiative", who: "you" },
        ],
      },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: TEXT,
    },
  ],
});
