import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Commander 2016 (C16). EDHREC rank 15269.
//
// One ability with two trigger events (`sameAbilityAs`): the Aura entering
// and its controller's upkeep. "Enchanted permanent" is `"attached"`, read
// as the ability resolves.
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
