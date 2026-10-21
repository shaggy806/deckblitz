import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 9217.
//
// Rulings:
//   [2019-06-14] If you cycle a card during a player's end step, the exiled creature will remain
//     exiled until the next turn's end step.
//   [2019-06-14] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2019-06-14] Astral Drift's triggered ability resolves before the cycling ability does. You
//     won't draw until after you choose the target and choose whether to exile the creature.
//
// One ability with two trigger events: cycling this card (it triggers from the
// graveyard the card is discarded to) and cycling another card while it's on
// the battlefield.

const TEXT =
  "Whenever you cycle this card or cycle another card while this enchantment is on the battlefield, you may exile target creature. If you do, return that card to the battlefield under its owner's control at the beginning of the next end step.";

const EFFECT: EffectSpec = {
  kind: "may",
  prompt: "Exile target creature? (It returns at the beginning of the next end step.)",
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    returnText: "Return the exiled card to the battlefield under its owner's control.",
  },
};

export default defineCard({
  name: "Astral Drift",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  cycling: { cost: "{2}{W}" },
  text: `${TEXT}\nCycling {2}{W} ({2}{W}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "cycles", who: "you", otherOnly: true },
      sameAbilityAs: 0,
      targets: ["creature"],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
