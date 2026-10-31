import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// Cursed Scroll on a creature: the name chosen as it resolves, the card
// picked at random from your hand and revealed (rule 701.20a), the damage to
// the target chosen as it was activated (slot 0, the revealed card in slot 1).

const TEXT =
  "{3}, {T}: Choose a card name, then reveal a card at random from your hand. If that card has the chosen name, this creature deals 2 damage to any target.";

export default defineCard({
  name: "Magus of the Scroll",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "choose-random-card",
          zone: "hand",
          show: "reveal",
          slot: 1,
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 1, filter: { hasName: CHOSEN_CARD_NAME }, now: true },
            then: { kind: "damage", amount: 2, target: 0 },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
