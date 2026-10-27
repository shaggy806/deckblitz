import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 26669.
//
// The defending player is the `becomes-blocked` trigger's player (Slate Street Ruffian).

const TEXT = "Whenever this creature becomes blocked, defending player sacrifices a land of their choice.";

export default defineCard({
  name: "Thresher Beast",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
