import { defineCard } from "../define.js";

// Planar Chaos (PLC). The cast trigger asks each player in turn from the
// active player (the ruling, rule 101.4); each may still pay once one has.
// The life is each asked player's own half, rounded up (rule 107.1a), read as
// they're asked, and paying it is losing it (rule 119.4). Any payment counters
// Temporal Extortion (Dash Hopes' `counter` of `"source"`); a second finds it
// already gone.
const CAST =
  "When you cast this spell, any player may pay half their life, rounded up. If a player does, counter Temporal Extortion.";

export default defineCard({
  name: "Temporal Extortion",
  manaCost: "{B}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${CAST}\nTake an extra turn after this one.`,
  effect: { kind: "take-extra-turn" },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ payLifeAmount: { half: { lifeTotal: "each" }, round: "up" }, text: "Pay {X} life" }],
        ifDid: { kind: "counter", target: "source" },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
