import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// The name is chosen as the ability resolves, then the card is picked at
// random from your hand and revealed (rule 701.20a); the damage goes to the
// target chosen as it was activated, which waits in slot 0 while the
// revealed card sits beside it in slot 1. An empty hand reveals nothing, so
// nothing has the name.

const TEXT =
  "{3}, {T}: Choose a card name, then reveal a card at random from your hand. If that card has the chosen name, this artifact deals 2 damage to any target.";

export default defineCard({
  name: "Cursed Scroll",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
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
