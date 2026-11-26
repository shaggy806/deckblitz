import { defineCard } from "../define.js";

// EDHREC rank 22456.
//
// The opponent is chosen as the ability is activated (its target); "when it
// regenerates this way" is a triggered ability the regeneration sets off
// (a reflexive one, rule 603.12) — the shield's `ifRegenerates`, a reflexive trigger whose
// "that player" is that opponent (`thatPlayer`). A shield never used draws
// nothing.

const TEXT =
  "{1}: Choose target opponent. Regenerate this creature. When it regenerates this way, that player may draw a card.";

export default defineCard({
  name: "Soldevi Sentry",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "regenerate",
        target: "source",
        thatPlayer: { target: 0 },
        ifRegenerates: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "each-player-may",
            who: "trigger-player",
            prompt: "Draw a card?",
            effect: { kind: "draw", amount: 1 },
          },
          text: "When it regenerates this way, that player may draw a card.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
