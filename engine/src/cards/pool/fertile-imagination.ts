import { defineCard } from "../define.js";
import { CHOSEN_CARD_TYPE } from "../../effects.js";

// Mercadian Masques (MMQ).
//
// As Blood Oath: the card type chosen as it resolves, the hand revealed,
// two Saprolings per card of that type among it.

const TEXT =
  "Choose a card type. Target opponent reveals their hand. Create two 1/1 green Saproling creature tokens for each card of the chosen type revealed this way. (Artifact, battle, creature, enchantment, instant, kindred, land, planeswalker, and sorcery are card types.)";

export default defineCard({
  name: "Fertile Imagination",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
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
          kind: "create-token",
          token: "Saproling Token",
          count: { product: [2, { thisWay: "revealed", filter: { type: CHOSEN_CARD_TYPE } }] },
        },
      ],
    },
  },
});
