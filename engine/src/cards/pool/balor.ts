import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 4508. Vindictive Lich's modal shape, on attack or death; the
// third mode reads the mode's own target's hand.

const CHOOSE_TEXT = "Whenever this creature attacks or dies, choose one or more. Each mode must target a different player.";
const DRAW_MODE = "Target opponent draws three cards, then discards three cards at random.";
const SAC_MODE = "Target opponent sacrifices a nontoken artifact of their choice.";
const DAMAGE_MODE = "This creature deals damage to target opponent equal to the number of cards in their hand.";

const MODAL: EffectSpec = {
  kind: "modal",
  announced: true,
  eachTargetsDifferentPlayer: true,
  minModes: 1,
  maxModes: 3,
  modes: [
    {
      text: DRAW_MODE,
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3, target: 0 },
          { kind: "discard", target: 0, amount: 3, random: true },
        ],
      },
    },
    {
      text: SAC_MODE,
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "artifact", token: false }, count: 1 },
    },
    {
      text: DAMAGE_MODE,
      targets: ["opponent"],
      effect: { kind: "damage", amount: { cardsInHand: { target: 0 } }, target: 0 },
    },
  ],
};

export default defineCard({
  name: "Balor",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE_TEXT}\n• ${DRAW_MODE}\n• ${SAC_MODE}\n• ${DAMAGE_MODE}`,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MODAL, resolve: null, text: `${CHOOSE_TEXT} ${DRAW_MODE} ${SAC_MODE} ${DAMAGE_MODE}` },
    { trigger: { on: "dies", who: "self" }, targets: [], effect: MODAL, resolve: null, text: `${CHOOSE_TEXT} ${DRAW_MODE} ${SAC_MODE} ${DAMAGE_MODE}` },
  ],
});
