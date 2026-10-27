import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 12711.
//
// Rulings:
//   The creatures have the triggered ability, so each creature's controller
//     chooses one of their opponents to target.
//
// The granted dies trigger targets an opponent of the creature's controller;
// its delayed half puts that card (the trigger object, only if it's still the
// same card in the graveyard — rule 400.7) onto the battlefield under that
// player's control at the beginning of the next end step.

const GRANTED_TEXT =
  "When this creature dies, choose target opponent. That player puts this card from its owner's graveyard onto the battlefield under their control at the beginning of the next end step.";

export default defineCard({
  name: "Endless Whispers",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `Each creature has "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "all-creatures" },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: ["opponent"],
          effect: {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "put-onto-battlefield", target: "trigger-object", under: { target: 0 } },
            text: "That player puts this card from its owner's graveyard onto the battlefield under their control.",
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Each creature has "${GRANTED_TEXT}"`,
    },
  ],
});
