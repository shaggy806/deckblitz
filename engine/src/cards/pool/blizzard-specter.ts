import { defineCard } from "../define.js";

// EDHREC rank 14553.
//
// The mode is chosen as the ability is put on the stack (rule 700.2b; the
// ruling). The first mode's permanent is chosen by the player who was dealt
// the damage as it resolves, not targeted: one with hexproof or protection
// from black may be chosen (the ruling). The second may be chosen with that
// player's hand empty.
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, choose one —";
const RETURN_MODE = "That player returns a permanent they control to its owner's hand.";
const DISCARD_MODE = "That player discards a card.";

export default defineCard({
  name: "Blizzard Specter",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\n• ${RETURN_MODE}\n• ${DISCARD_MODE}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: RETURN_MODE,
            effect: {
              kind: "choose-permanents",
              chooser: "trigger-player",
              filter: { controlledBy: "you" },
              min: 1,
              upTo: 1,
              then: { kind: "return-to-hand", target: 0 },
              prompt: "Return a permanent you control to its owner's hand",
            },
          },
          { text: DISCARD_MODE, effect: { kind: "discard", target: "trigger-player", amount: 1 } },
        ],
      },
      resolve: null,
      text: `${DAMAGE_TEXT} ${RETURN_MODE} ${DISCARD_MODE}`,
    },
  ],
});
