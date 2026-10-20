import { defineCard } from "../define.js";

// EDHREC rank 10803.
//
// Rulings:
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//
// Channel (rule 702.51a) is a hand ability that discards the card as its
// cost; "it" deals the damage — the discarded card is the source (Trumpeting
// Carnosaur's shape).
const ENTER_TEXT = "When this creature enters, it deals 2 damage to any target.";
const CHANNEL_TEXT = "Channel — {1}{R}, Discard this card: It deals 2 damage to any target.";

export default defineCard({
  name: "Twinshot Sniper",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Goblin", "Archer"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT}\n${CHANNEL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      zone: "hand",
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
