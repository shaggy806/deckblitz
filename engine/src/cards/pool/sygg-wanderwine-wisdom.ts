import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 11497. A transforming double-faced card (Ashling, Rekindled's
// shape); the back face is Sygg, Wanderbrine Shield. The granted "player or
// planeswalker" trigger is two triggers, as Psychic Frog's: an attacker deals
// its combat damage to the one player or planeswalker it attacks.
//
// Rulings:
//   [2025-11-17] In some rare cases, this permanent might transform while its triggered ability
//     that allows you to pay mana to transform it is still on the stack. (For example, another
//     effect might cause that ability to trigger an additional time.) In such a case, even if you
//     pay mana as the triggered ability resolves, this permanent won't transform because it
//     already transformed while the triggered ability was on the stack.

const GRANT_TEXT =
  "Whenever this creature enters or transforms into Sygg, Wanderwine Wisdom, target creature gains \"Whenever this creature deals combat damage to a player or planeswalker, draw a card\" until end of turn.";
const DRAW_TEXT = "Whenever this creature deals combat damage to a player or planeswalker, draw a card.";
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {W}. If you do, transform Sygg.";

const GRANT: EffectSpec = {
  kind: "sequence",
  effects: [
    {
      kind: "grant-triggered",
      target: 0,
      duration: "end-of-turn",
      ability: {
        trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
        targets: [],
        effect: { kind: "draw", amount: 1 },
        resolve: null,
        text: DRAW_TEXT,
      },
    },
    {
      kind: "grant-triggered",
      target: 0,
      duration: "end-of-turn",
      ability: {
        trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
        targets: [],
        effect: { kind: "draw", amount: 1 },
        resolve: null,
        text: DRAW_TEXT,
      },
    },
  ],
};

export default defineCard({
  name: "Sygg, Wanderwine Wisdom",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `Sygg can't be blocked.\n${GRANT_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: GRANT,
      resolve: null,
      text: GRANT_TEXT,
    },
    {
      trigger: { on: "transforms", who: "self", intoFront: true },
      sameAbilityAs: 0,
      targets: ["creature"],
      effect: GRANT,
      resolve: null,
      text: GRANT_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to transform Sygg?",
        cost: "{W}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "Sygg can't be blocked.",
    },
  ],
  faces: ["Sygg, Wanderwine Wisdom", "Sygg, Wanderbrine Shield"],
  transform: true,
});
