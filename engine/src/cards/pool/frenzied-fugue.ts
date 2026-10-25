import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 15269.
//
// "When this Aura enters and at the beginning of your upkeep" is one ability
// with two trigger events (`sameAbilityAs`). It acts on the enchanted
// permanent (`"attached"`), not a target.

const TEXT =
  "When this Aura enters and at the beginning of your upkeep, gain control of enchanted permanent until end of turn. Untap that permanent. It gains haste until end of turn.";

const STEAL: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "gain-control", target: "attached", untilEndOfTurn: true },
    { kind: "untap", target: "attached" },
    { kind: "grant-keyword", target: "attached", keyword: "haste", duration: "end-of-turn" },
  ],
};

export default defineCard({
  name: "Frenzied Fugue",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant permanent\n${TEXT}`,
  targets: ["permanent"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: STEAL,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: STEAL,
      resolve: null,
      text: TEXT,
    },
  ],
});
