import { defineCard } from "../define.js";

// EDHREC rank 20185. The Lost Caverns of Ixalan.
//
// Descend 4 is an intervening "if" (rule 603.4, the ruling): checked as it
// attacks and again as the trigger resolves. "Permanent cards" are artifact,
// battle, creature, enchantment, land and planeswalker cards.

const TEXT =
  "Descend 4 — Whenever this creature attacks, if there are four or more permanent cards in your graveyard, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Malamet Veteran",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 4,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
