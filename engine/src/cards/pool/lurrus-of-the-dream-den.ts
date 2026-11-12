import { defineCard } from "../define.js";

// EDHREC rank 2870.
//
// Rulings: the spell follows its own timing; for a spell with {X} in its
// mana cost, the value chosen for X counts toward its mana value ({X}{W} with
// X = 1, not 2); a spell cast from your graveyard under another permission
// doesn't use Lurrus's; a new Lurrus that turn gives another. The permission
// is read with the X announced (`FilterContext.castX`).
const RECAST = "Once during each of your turns, you may cast a permanent spell with mana value 2 or less from your graveyard.";

export default defineCard({
  name: "Lurrus of the Dream-Den",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Nightmare"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Companion — Each permanent card in your starting deck has mana value 2 or less. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nLifelink\n${RECAST}`,
  companion: { kind: "each-card", of: "permanent", test: { manaValueAtMost: 2 } },
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        spell: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 2 } },
        oncePerTurn: true,
        yourTurnOnly: true,
      },
      text: RECAST,
    },
  ],
});
