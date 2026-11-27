import { defineCard } from "../define.js";

// EDHREC rank 25413. The caster is "that player" of the cast trigger: they're
// the one asked to pay {1} (`each-player-may` with `who: "trigger-player"`),
// and the delayed ability set up when they do keeps them (its `refs`), so
// "they draw a card" at the next end step is the caster's draw — though the
// delayed ability, like the trigger that made it, is Horn of Plenty's
// controller's (rule 603.7e).
const TEXT =
  "Whenever a player casts a spell, they may pay {1}. If the player does, they draw a card at the beginning of the next end step.";

export default defineCard({
  name: "Horn of Plenty",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        prompt: "Pay {1} to draw a card at the beginning of the next end step?",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        ifDid: {
          kind: "delayed-trigger",
          at: { step: "end" },
          effect: { kind: "draw", amount: 1, who: "trigger-player" },
          text: "Draw a card.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
