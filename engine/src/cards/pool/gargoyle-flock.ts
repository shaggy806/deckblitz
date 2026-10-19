import { defineCard } from "../define.js";

// EDHREC rank 16352.
//
// "A creature entered the battlefield under your control this turn" is
// Wary Farmer's intervening-if without its "another": Gargoyle Flock
// entering this turn counts too.

const SKYSWARM_TEXT =
  "Skyswarm — At the beginning of your end step, if a creature entered the battlefield under your control this turn, create a 1/1 blue Tyranid Gargoyle creature token with flying.";

export default defineCard({
  name: "Gargoyle Flock",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Tyranid", "Gargoyle"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${SKYSWARM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Tyranid Gargoyle Token", count: 1 },
      resolve: null,
      text: SKYSWARM_TEXT,
    },
  ],
});
