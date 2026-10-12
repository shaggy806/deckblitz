import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 19436. Marvel Super Heroes Commander.
//
// One ability with two trigger events, written as two entries
// (`sameAbilityAs`). "You may pay {1}{W}. When you do" is Go-Shintai of
// Hidden Cruelty's shape: the reflexive ability targets only once the mana
// is paid, then Acrobatic Maneuver's flicker, back under its owner's control.
const TEXT =
  "When this enchantment enters and at the beginning of your end step, you may pay {1}{W}. When you do, exile target creature you control, then return that card to the battlefield under its owner's control.";

const BLINK: EffectSpec = {
  kind: "may",
  prompt: "Pay {1}{W} to exile a creature you control and return it?",
  cost: "{1}{W}",
  effect: {
    kind: "reflexive-trigger",
    targets: ["creature-you-control"],
    effect: { kind: "flicker", target: 0 },
    text: "When you do, exile target creature you control, then return that card to the battlefield under its owner's control.",
  },
};

export default defineCard({
  name: "Quantum Entanglement",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: BLINK, resolve: null, text: TEXT },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: BLINK,
      resolve: null,
      text: TEXT,
    },
  ],
});
