import { defineCard } from "../define.js";

// EDHREC rank 9881.
//
// An outlaw is an Assassin, Mercenary, Pirate, Rogue and/or Warlock (rule
// 700.12). "Encore {X}, where X is its mana value" is a fixed cost for each
// card, so there's no X to choose.
export default defineCard({
  name: "Graywater's Fixer",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Mercenary"],
  power: 4,
  toughness: 4,
  text: "Each outlaw creature card in your graveyard has encore {X}, where X is its mana value. (Exile it and pay its encore cost: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)",
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: {
        filter: { type: "creature", subtypes: ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"] },
        keywords: [{ keyword: "encore", cost: "mana-value" }],
      },
      text: "Each outlaw creature card in your graveyard has encore {X}, where X is its mana value.",
    },
  ],
});
