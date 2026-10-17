import { defineCard } from "../define.js";

// EDHREC rank 12022.
//
// Rulings:
//   [2023-06-16] Snow mana is not a type of mana. Lidless Gaze won't let you pay a snow cost using
//     mana produced by a nonsnow source.
//   [2023-06-16] Lidless Gaze uses a new template indicating that you may spend mana as though it
//     were mana of any type to cast the exiled cards. The six types of mana are white, blue,
//     black, red, green, and colorless.

export default defineCard({
  name: "Lidless Gaze",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  flashback: { cost: "{2}{B}{R}" },
  text: "Exile the top card of each player's library. Until the end of your next turn, you may play those cards, and mana of any type can be spent to cast those spells.\nFlashback {2}{B}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  // Each player's top card, yours included, all exiled at once; you may play
  // them all, spending mana as though it were of any type (rule 118.14).
  targets: [],
  effect: {
    kind: "impulse-exile",
    amount: 1,
    whose: "each-player",
    duration: "your-next-turn",
    spendAs: "any-type",
  },
});
