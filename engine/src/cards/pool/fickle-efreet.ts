import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Prophecy (PCY). EDHREC rank 21922.
//
// Each trigger sets up a delayed "at end of combat" ability (Cinder Wall's shape): its
// controller flips a coin as it resolves, and on a loss chooses one of their opponents
// (`choose-opponent`, as Rainbow Vale's), who gains control of the Efreet for good. An Efreet
// that has left the battlefield since is a new object (rule 400.7) and stays put.

const TEXT =
  "Whenever this creature attacks or blocks, flip a coin at end of combat. If you lose the flip, an opponent gains control of this creature.";

const AT_END_OF_COMBAT: EffectSpec = {
  kind: "delayed-trigger",
  at: "end-of-combat",
  text: "Flip a coin. If you lose the flip, an opponent gains control of Fickle Efreet.",
  effect: {
    kind: "flip-coin",
    lost: {
      kind: "choose-opponent",
      then: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
    },
  },
};

export default defineCard({
  name: "Fickle Efreet",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 5,
  toughness: 2,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: AT_END_OF_COMBAT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: AT_END_OF_COMBAT, resolve: null, text: TEXT },
  ],
});
