import { defineCard } from "../define.js";

// The card is picked at random from the target player's hand and revealed
// (rule 701.20a); it stays in their hand, its mana value read there — slot
// 1, beside the player in slot 0. An empty hand reveals nothing and loses
// nothing.

const TEXT =
  "When this creature enters, target player reveals a card at random from their hand, then loses life equal to that card's mana value.";

export default defineCard({
  name: "Singe-Mind Ogre",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Mutant"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "choose-random-card",
        zone: "hand",
        whose: 0,
        show: "reveal",
        slot: 1,
        then: { kind: "lose-life", amount: { manaValueOf: 1 }, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
