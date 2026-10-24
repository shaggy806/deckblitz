import { defineCard } from "../define.js";

// EDHREC rank 10125.
//
// Rulings:
//   [2022-12-08] If you choose not to cast a card with madness when the madness triggered ability
//     resolves, it's put into your graveyard. Madness doesn't give you another chance to cast it
//     later.
//   [2022-12-08] Casting a spell with madness ignores the timing rules based on the card's card
//     type.
//
// Capricious Sliver's impulse draw, this turn only; madness is the card field.
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, exile the top card of your library. Until end of turn, you may play that card.";

export default defineCard({
  name: "Stromkirk Occultist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Horror"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  madness: { cost: "{1}{R}" },
  text: `Trample\n${DAMAGE_TEXT}\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
