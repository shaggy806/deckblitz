import { defineCard } from "../define.js";

// Planar Chaos (PLC). Argothian Wurm's ask, on Mana Vortex's cast trigger:
// each player in turn from the active player (the ruling) may sacrifice a
// creature they control, each still asked once one has; any sacrifice
// counters the spell. Cast for its madness cost, it's cast all the same.
const CAST =
  "When you cast this spell, any player may sacrifice a creature of their choice. If a player does, counter Brain Gorgers.";

export default defineCard({
  name: "Brain Gorgers",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 2,
  madness: { cost: "{1}{B}" },
  text: `${CAST}\nMadness {1}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ sacrifice: { type: "creature", controlledBy: "you" }, text: "Sacrifice a creature" }],
        ifDid: { kind: "counter", target: "source" },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
