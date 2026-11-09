import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// "This coin flip has no winner or loser" (the ruling): sides only. Every
// player flips before anyone sacrifices.
const TEXT = "Whenever this creature or another Goblin enters, each player flips a coin. Each player whose coin comes up tails sacrifices a creature of their choice.";
const FLIP_AND_SACRIFICE: EffectSpec = {
  kind: "sequence",
  effects: [
    {
      kind: "for-each-player",
      who: "each-player",
      effect: { kind: "as-player", who: "that-player", effect: { kind: "flip-coin", sides: true } },
    },
    {
      kind: "for-each-player",
      who: "each-player",
      whoIf: { kind: "this-way", what: "coins-tails", who: "that-player", atLeast: 1 },
      effect: { kind: "sacrifice", who: "that-player", filter: { type: "creature" }, count: 1 },
    },
  ],
};

export default defineCard({
  name: "Goblin Assassin",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Assassin"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: FLIP_AND_SACRIFICE, resolve: null, text: TEXT },
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { subtype: "Goblin" }, otherOnly: true },
      targets: [],
      effect: FLIP_AND_SACRIFICE,
      resolve: null,
      text: TEXT,
    },
  ],
});
