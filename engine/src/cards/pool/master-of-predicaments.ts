import { defineCard } from "../define.js";

// EDHREC rank 9415.
//
// - The card is chosen from your hand without revealing it (its ruling): a
//   `look-and-choose` of your hand that stays, which shows it to nobody.
// - The damaged player guesses (the `guess` effect, rule 608.2d); an {X} in
//   the card's mana cost is 0 (rule 202.3e). Nothing tells them whether they
//   were right unless the card is cast (its ruling).
// - Guessed wrong, you may cast it as this resolves, free, whatever its
//   type's timing (rule 608.2g); a land card can't be played this way.

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, choose a card in your hand. That player guesses whether the card's mana value is greater than 4. If the player guessed wrong, you may cast the card without paying its mana cost.";

export default defineCard({
  name: "Master of Predicaments",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt: "Choose a card in your hand — the player guesses whether its mana value is greater than 4",
          },
          {
            kind: "guess",
            who: "trigger-player",
            about: "chosen-this-way",
            whether: [
              {
                filter: { manaValue: { op: "gt", n: 4 } },
                yes: "Guess the chosen card's mana value is greater than 4",
                no: "Guess it's 4 or less",
              },
            ],
            ifWrong: { kind: "cast-now", from: "chosen-this-way", free: true },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
