import { defineCard } from "../define.js";
import { CHOSEN_CARD_NAME } from "../../effects.js";

const TEXT =
  "Whenever Isperia deals combat damage to a player, choose a card name. That player reveals their hand. If a card with the chosen name is revealed this way, search your library for a creature card with flying, reveal it, put it into your hand, then shuffle.";

// Any card name (rule 201.4), named before the hand is seen. No card with that
// name revealed, no search at all, so no shuffle.
export default defineCard({
  name: "Isperia the Inscrutable",
  manaCost: "{1}{W}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "sequence",
          effects: [
            { kind: "reveal-hand", who: "trigger-player" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "revealed", filter: { hasName: CHOSEN_CARD_NAME } },
              then: {
                kind: "search-library",
                filter: { type: "creature", keyword: "flying" },
                destination: "hand",
                min: 0,
                max: 1,
                reveal: true,
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
