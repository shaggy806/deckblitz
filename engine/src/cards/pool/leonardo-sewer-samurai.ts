import { defineCard } from "../define.js";

// EDHREC rank 13632. TMT. A static graveyard permission (rule 601.3), open
// only during its holder's turn (`yourTurnOnly`), for creature spells with
// power or toughness 1 or less — judged as the face cast (601.3e), every cost
// paid and timing kept (the ruling). "If you cast a spell this way, that
// creature enters with a finality counter on it" is the permission's
// `entersWith`: only a cast under this permission — not one under Muldrotha's
// or another permission reaching the same card (the player names which,
// 601.3) — enters with it (614.1c); `moveObject` reads the finality counter.
//
// Rulings:
//   [2026-01-27] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2026-01-27] Finality counters work on any permanent, not only creatures. If a permanent with a
//     finality counter on it would be put into a graveyard from the battlefield, exile it instead.
//   [2026-01-27] Multiple finality counters on a single permanent are redundant.
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.
//   [2026-01-27] Finality counters aren't keyword counters, and a finality counter doesn't give any
//     abilities to the permanent it's on. If that permanent loses its abilities and then would go
//     to a graveyard, it will still be exiled instead.
//   [2026-01-27] You pay all costs and follow all timing rules for cards played with the permission
//     granted by Leonardo's last ability.
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, its controller chooses which player,
//     planeswalker, or battle it's attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).

const CAST_TEXT =
  "During your turn, you may cast creature spells with power or toughness 1 or less from your graveyard. If you cast a spell this way, that creature enters with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "Leonardo, Sewer Samurai",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["double strike"],
  sneak: { cost: "{2}{W}{W}" },
  text: `Sneak {2}{W}{W}\nDouble strike\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        spell: {
          type: "creature",
          anyOf: [{ power: { op: "lte", n: 1 } }, { toughness: { op: "lte", n: 1 } }],
        },
        yourTurnOnly: true,
        entersWith: { kind: "finality", amount: 1 },
      },
      text: CAST_TEXT,
    },
  ],
});
