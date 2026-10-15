import { defineCard } from "../define.js";

// EDHREC rank 10461.
//
// Rulings:
//   [2025-06-06] You cast the instant or sorcery while Seifer Almasy's last ability is
//     resolving and still on the stack. You can't wait to cast it later in the turn. Timing
//     restrictions based on the card's type are ignored.
//   [2025-06-06] If a card in your graveyard has {X} in its mana cost, X is 0 for the purpose
//     of determining its mana value and you must choose 0 as the value of X when casting it
//     without paying its mana cost.
//   [2025-06-06] A creature attacks alone if it's the only creature declared as an attacker
//     during the declare attackers step.
//   [2025-06-06] If you cast a spell "without paying its mana cost," you can't choose to cast it
//     for any alternative costs. You can, however, pay additional costs.
//
// Squall, SeeD Mercenary's attacks-alone trigger and Victor Timely's free
// cast from the graveyard (`cast-now`, `exileAfter`).
const ALONE_TEXT = "Whenever a creature you control attacks alone, it gains double strike until end of turn.";
const FIRE_CROSS_TEXT =
  "Fire Cross — Whenever Seifer Almasy deals combat damage to a player, you may cast target instant or sorcery card with mana value 3 or less from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Seifer Almasy",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  text: `${ALONE_TEXT}\n${FIRE_CROSS_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: ALONE_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: FIRE_CROSS_TEXT,
    },
  ],
});
