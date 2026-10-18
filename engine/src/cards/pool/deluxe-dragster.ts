import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 7191.
//
// "That player's graveyard" is the damaged player's (`whose:
// "trigger-player"`, Skullsnatcher's shape); the cast is part of the
// trigger's resolution, timing ignored, free, and exiled instead of going to
// a graveyard (`cast-now` with `exileAfter` — Diluvian Primordial's shape).
//
// Rulings:
//   [2023-04-14] If you cast the instant or sorcery card, you do so as part of the resolution of
//     the triggered ability. You can't wait to cast them later in the turn. Timing restrictions
//     based on a card's type are ignored.
//   [2023-04-14] If an exiled card has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.
//   [2023-04-14] If you cast a card "without paying its mana cost," you can't pay any alternative
//     costs. You can, however, pay additional costs. If the card has any mandatory additional
//     costs, those must be paid to cast the card.

const EVASION_TEXT = "This Vehicle can't be blocked except by Vehicles.";
const DAMAGE_TEXT =
  "Whenever this Vehicle deals combat damage to a player, you may cast target instant or sorcery card from that player's graveyard without paying its mana cost. If that spell would be put into a graveyard, exile it instead.";

export default defineCard({
  name: "Deluxe Dragster",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  text: `${EVASION_TEXT}\n${DAMAGE_TEXT}\nCrew 2`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notSubtypes: ["Vehicle"] },
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "trigger-player",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [crew(2)],
});
