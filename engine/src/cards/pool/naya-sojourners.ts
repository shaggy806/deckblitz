import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// One ability with two trigger events (the ruling): cycling this card, and
// this creature dying. Cycling needs no target for it (the cycling ability has
// none).
const TEXT = "When you cycle this card and when this creature dies, you may put a +1/+1 counter on target creature.";

const EFFECT: EffectSpec = {
  kind: "may",
  prompt: "Put a +1/+1 counter on target creature?",
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
};

export default defineCard({
  name: "Naya Sojourners",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 5,
  toughness: 3,
  cycling: { cost: "{2}{G}" },
  text: `${TEXT}\nCycling {2}{G} ({2}{G}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      sameAbilityAs: 0,
      targets: ["creature"],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
