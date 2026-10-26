import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// One ability with two trigger events (the ruling): cycling this card, and
// this creature dying. It may target this card itself, already in the
// graveyard by the time the ability triggers.
const TEXT = "When you cycle this card and when this creature dies, you may exile target card from a graveyard.";

const EFFECT: EffectSpec = {
  kind: "may",
  prompt: "Exile target card from a graveyard?",
  effect: { kind: "exile", target: 0 },
};

export default defineCard({
  name: "Grixis Sojourners",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Ogre"],
  power: 4,
  toughness: 3,
  cycling: { cost: "{2}{B}" },
  text: `${TEXT}\nCycling {2}{B} ({2}{B}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      sameAbilityAs: 0,
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
