import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 26081. Cursed Scroll's shape, the hand the target opponent's: the
// revealed card sits beside the target in slot 1 and, named, is discarded.

const GRANTED =
  "{T}: Choose a card name. Target opponent reveals a card at random from their hand. If that card has the chosen name, that player discards it. Activate only during your turn.";
const TEXT = `All Slivers have "${GRANTED}"`;

export default defineCard({
  name: "Dementia Sliver",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["opponent"],
          condition: { kind: "your-turn" },
          effect: {
            kind: "choose-card-name",
            then: {
              kind: "choose-random-card",
              zone: "hand",
              whose: 0,
              show: "reveal",
              slot: 1,
              then: {
                kind: "conditional",
                condition: { kind: "target", index: 1, filter: { hasName: CHOSEN_CARD_NAME }, now: true },
                then: { kind: "discard-card", target: 1 },
              },
            },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
