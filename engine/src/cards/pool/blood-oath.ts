import { defineCard } from "../define.js";
import { CHOSEN_CARD_TYPE } from "../../effects.js";

// Mercadian Masques (MMQ).
//
// The card type is chosen as the spell resolves (`choose-value`, rule
// 205.2a's nine); the hand is revealed (`reveal-hand`) and every card of
// that type among it counted — a card of two types, a kindred enchantment,
// counts for each.

const TEXT =
  "Choose a card type. Target opponent reveals their hand. Blood Oath deals 3 damage to that player for each card of the chosen type revealed this way. (Artifact, battle, creature, enchantment, instant, kindred, land, planeswalker, and sorcery are card types.)";

export default defineCard({
  name: "Blood Oath",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "choose-value",
    value: "card-type",
    then: {
      kind: "sequence",
      effects: [
        { kind: "reveal-hand", who: 0 },
        {
          kind: "damage",
          target: 0,
          amount: { product: [3, { thisWay: "revealed", filter: { type: CHOSEN_CARD_TYPE } }] },
        },
      ],
    },
  },
});
