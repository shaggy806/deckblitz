import { defineCard } from "../define.js";

// EDHREC rank 25969. One ability with two trigger events, written as two
// entries tied by `sameAbilityAs`.
//
// Rulings:
//   [2009-05-01] If you cycle this card, the cycling ability goes on the stack, then the triggered
//     ability goes on the stack on top of it. The triggered ability will resolve before you draw a
//     card from the cycling ability.
//   [2009-05-01] You can cycle this card even if there are no targets for the triggered ability.
//   [2009-05-01] The cycling ability and the triggered ability are separate.
//   [2009-05-01] The player who controls the triggered ability is the player who cycled the
//     Sojourner, or the player who last controlled the Sojourner on the battlefield.
const TRIGGER_TEXT = "When you cycle this card and when this creature dies, you may tap or untap target permanent.";
const TAP_OR_UNTAP = {
  kind: "modal",
  minModes: 0,
  maxModes: 1,
  modes: [
    { text: "Tap target permanent.", effect: { kind: "tap", target: 0 } },
    { text: "Untap target permanent.", effect: { kind: "untap", target: 0 } },
  ],
} as const;

export default defineCard({
  name: "Esper Sojourners",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 3,
  cycling: { cost: "{2}{U}" },
  text: `${TRIGGER_TEXT}\nCycling {2}{U} ({2}{U}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["permanent"],
      effect: TAP_OR_UNTAP,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      sameAbilityAs: 0,
      targets: ["permanent"],
      effect: TAP_OR_UNTAP,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
