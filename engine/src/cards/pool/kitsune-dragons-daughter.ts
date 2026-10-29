import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";

const TEXT =
  "Whenever Kitsune enters or deals combat damage to a player, you may exchange control of two other target creatures controlled by different players.";
// "Two other target creatures controlled by different players": neither is
// Kitsune, and the second's controller isn't the first's (rechecked as it
// resolves — the Run Away Together rulings).
const OTHER_CREATURE: TargetSpec = { kind: "other", of: "creature", than: "source" };
const TARGETS: readonly TargetSpec[] = [
  OTHER_CREATURE,
  { kind: "other", of: OTHER_CREATURE, than: { slot: 0 }, differentController: true },
];
// Rule 701.12b: all or nothing — no exchange if either target is illegal.
const EXCHANGE: EffectSpec = {
  kind: "may",
  prompt: "Exchange control of the two creatures?",
  effect: { kind: "exchange-control", objects: [0, 1] },
};

export default defineCard({
  name: "Kitsune, Dragon's Daughter",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Warlock", "Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: TARGETS,
      effect: EXCHANGE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      sameAbilityAs: 0,
      targets: TARGETS,
      effect: EXCHANGE,
      resolve: null,
      text: TEXT,
    },
  ],
});
