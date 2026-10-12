import { defineCard } from "../define.js";
import { VOID_CONDITION } from "../helpers.js";

// EDHREC rank 23171.
//
// Rulings:
//   [2025-07-25] If you cast a spell “without paying its mana cost,” you can’t choose to cast it
//     for any alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the spell has any mandatory additional costs, such as that of Embrace Oblivion, those must
//     be paid to cast the spell.
//   [2025-07-25] If you don’t want to cast the copy, you can choose not to; the copy ceases to
//     exist the next time state-based actions are checked.
//   [2025-07-25] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X when casting it without paying its mana cost.
//   [2025-07-25] If an instant or sorcery card in your graveyard has {X} in its mana cost, X is 0
//     for the purpose of determining its mana value.
//   [2025-07-25] You cast the copy while Roving Actuator’s ability is resolving and still on the
//     stack. You can’t wait to cast it later in the turn.
// Mizzix's Mastery's shape: the exiled card is copied and the copy may be
// cast for free as the ability resolves (rule 707.12); one not cast ceases to
// exist.

const VOID_TEXT =
  "Void — When this creature enters, if a nonland permanent left the battlefield this turn or a spell was warped this turn, exile up to one target instant or sorcery card with mana value 2 or less from your graveyard. Copy it. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Roving Actuator",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 4,
  text: VOID_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 2 } },
          },
        },
      ],
      condition: VOID_CONDITION,
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
        ],
      },
      resolve: null,
      text: VOID_TEXT,
    },
  ],
});
