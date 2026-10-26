import { defineCard } from "../define.js";

// Planar Chaos (PLC). The cast trigger asks each player in turn from the
// active player (the ruling); each may still pay once one has, and only one
// who has 5 life is offered it (rule 119.4). Any payment counters Dash Hopes
// (Mana Vortex's `counter` of `"source"`); a second finds it already gone.
const CAST = "When you cast this spell, any player may pay 5 life. If a player does, counter Dash Hopes.";

export default defineCard({
  name: "Dash Hopes",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `${CAST}\nCounter target spell.`,
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ payLife: 5, text: "Pay 5 life" }],
        ifDid: { kind: "counter", target: "source" },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
