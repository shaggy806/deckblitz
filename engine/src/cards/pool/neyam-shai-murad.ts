import { defineCard } from "../define.js";

// EDHREC rank 16927.
//
// Rulings:
//   [2022-10-07] If the card in your opponent's graveyard isn't a legal target as the ability tries
//     to resolve, it will be removed from the stack and your opponent won't get to choose a
//     permanent card from your graveyard.
//   [2022-10-07] You choose the target card in your opponent's graveyard as you put the triggered
//     ability on the stack. That opponent chooses the card in your graveyard as the ability
//     resolves.
//
// The target is in the damaged player's graveyard (Ink-Eyes' slot), returned
// to its owner's hand. "That player" chooses the card from your graveyard as
// it resolves (Tasigur's `chooser`, which in a damage trigger is the player
// dealt damage), and it enters under your control.

const TRADER_TEXT =
  "Rogue Trader — Whenever Neyam Shai Murad deals combat damage to a player, you may have that player return target permanent card from their graveyard to their hand. If you do, that player chooses a permanent card in your graveyard, then you put it onto the battlefield under your control.";

const PERMANENT_CARD = { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] } as const;

export default defineCard({
  name: "Neyam Shai Murad",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: TRADER_TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "trigger-player", filter: PERMANENT_CARD }],
      effect: {
        kind: "may",
        prompt: "Have that player return the target card to their hand, then choose a permanent card in your graveyard for you?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              chooser: "that-player",
              min: 1,
              max: 1,
              destination: "battlefield",
              leftover: "stay",
              filter: PERMANENT_CARD,
            },
          ],
        },
      },
      resolve: null,
      text: TRADER_TEXT,
    },
  ],
});
