import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9877. "That player" is the player dealt the damage. You
// search their library for a card — a quantity, so one is found while
// there's one (rule 701.23d) — and it stays there, not revealed (701.23e):
// the damaged player names a card without seeing it. Only then, if it's a
// creature card without that name, may you put it onto the battlefield
// under your control; then that player shuffles (`shufflesLater` and the
// `shuffle-library` of `searchers`, so the shuffle comes last, as printed).

const TEXT =
  "Whenever this creature deals combat damage to a player, search that player's library for a card, then that player chooses a card name. If you searched for a creature card that doesn't have that name, you may put it onto the battlefield under your control. Then that player shuffles.";

export default defineCard({
  name: "Sphinx Ambassador",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            whose: "trigger-player",
            filter: {},
            destination: "stay",
            min: 1,
            max: 1,
            shufflesLater: true,
            then: {
              kind: "choose-card-name",
              chooser: "that-player",
              aim: "own-library-creatures",
              then: {
                kind: "conditional",
                condition: { kind: "target", index: 0, filter: { type: "creature", notName: CHOSEN_CARD_NAME } },
                then: {
                  kind: "may",
                  prompt: "Put the creature card you found onto the battlefield under your control?",
                  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
                },
              },
            },
          },
          { kind: "shuffle-library", searchers: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
