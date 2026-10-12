import { defineCard } from "../define.js";

// EDHREC rank 10295.
//
// Rulings:
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).

export default defineCard({
  name: "New Generation's Technique",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  sneak: { cost: "{2}{G}" },
  text: "Sneak {2}{G} (You may cast this spell for {2}{G} if you also return an unblocked attacker you control to hand during the declare blockers step.)\nSearch your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: 2,
  },
});
