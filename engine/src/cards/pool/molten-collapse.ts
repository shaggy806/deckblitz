import { defineCard } from "../define.js";

// EDHREC rank 9654.
//
// Rulings:
//   [2023-11-10] Some cards refer to a player who has "descended this turn." This means that a
//     permanent card has been put into that player's graveyard from anywhere this turn.
//   [2023-11-10] A permanent card is an artifact, battle, creature, enchantment, land, or
//     planeswalker card. Tokens are not cards, and while tokens are put into the graveyard before
//     ceasing to exist, that action doesn't count as a player having descended.
//
// Flame of Anor's `maxModesIf`, on Enterprising Scallywag's "you descended
// this turn" — judged as the spell is cast (rule 700.2a).
export default defineCard({
  name: "Molten Collapse",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Choose one. If you descended this turn, you may choose both instead. (You descended if a permanent card was put into your graveyard from anywhere.)\n• Destroy target creature or planeswalker.\n• Destroy target noncreature, nonland permanent with mana value 1 or less.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "turn-history", what: "descended" }, maxModes: 2 },
    modes: [
      {
        text: "Destroy target creature or planeswalker.",
        targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target noncreature, nonland permanent with mana value 1 or less.",
        targets: [
          { kind: "permanent", whose: "any", filter: { notTypes: ["creature", "land"], manaValue: { op: "lte", n: 1 } } },
        ],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
