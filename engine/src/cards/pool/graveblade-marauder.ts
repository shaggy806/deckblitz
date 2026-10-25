import { defineCard } from "../define.js";

// EDHREC rank 16360.
// Ruling: count the creature cards in your graveyard as the ability resolves.

export default defineCard({
  name: "Graveblade Marauder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 4,
  keywords: ["deathtouch"],
  text: "Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nWhenever this creature deals combat damage to a player, that player loses life equal to the number of creature cards in your graveyard.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        who: "trigger-player",
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player loses life equal to the number of creature cards in your graveyard.",
    },
  ],
});
