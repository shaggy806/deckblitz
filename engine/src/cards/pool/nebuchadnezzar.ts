import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 25352. The name is chosen as the ability resolves (the ruling),
// then X different cards are picked at random from the target opponent's hand
// and revealed together; of those, every card with the chosen name is
// discarded. X larger than the hand reveals the whole hand.

const TEXT =
  "{X}, {T}: Choose a card name. Target opponent reveals X cards at random from their hand. Then that player discards all cards with that name revealed this way. Activate only during your turn.";

export default defineCard({
  name: "Nebuchadnezzar",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: ["opponent"],
      condition: { kind: "your-turn" },
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "choose-random-card",
          zone: "hand",
          whose: 0,
          show: "reveal",
          count: "x",
          then: {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            only: { hasName: CHOSEN_CARD_NAME },
            effect: { kind: "discard-card", target: 0 },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
