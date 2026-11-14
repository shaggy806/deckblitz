import { defineCard } from "../define.js";

// Rulings:
//   - For example, the first instant or sorcery spell cast during your turn causes Sentinel Tower
//     to deal 1 damage; the second causes it to deal 2 damage, and so on.
//   - You choose the target for Sentinel Tower's ability, regardless of who cast the spell that
//     caused it to trigger.
//   - Sentinel Tower's ability counts all instant and sorcery spells cast in the turn before the
//     spell that caused it to trigger, even if those spells are still on the stack or have been
//     countered.
//   - Sentinel Tower's ability resolves before the spell that caused it to trigger. It resolves
//     even if that spell is countered.
//
// Every player's spells count, each read as it was cast (`castThisTurn` with `who:
// "each-player"`), and only those cast ahead of the triggering spell (`before: "trigger-spell"`),
// so one cast in response doesn't raise it.

const TEXT =
  "Whenever an instant or sorcery spell is cast during your turn, this artifact deals damage to any target equal to 1 plus the number of instant and sorcery spells cast before that spell this turn.";

export default defineCard({
  name: "Sentinel Tower",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"] } },
      condition: { kind: "your-turn" },
      targets: ["any-target"],
      effect: {
        kind: "damage",
        amount: {
          sum: [
            1,
            {
              castThisTurn: { typesAnyOf: ["instant", "sorcery"] },
              who: "each-player",
              before: "trigger-spell",
            },
          ],
        },
        target: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
