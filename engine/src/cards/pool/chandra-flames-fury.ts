import { defineCard } from "../define.js";

// Core Set 2020. Each two-recipient ability deals its damage as one event
// (Shocker, Unshakable's shape). An illegal target means no damage at all
// (the rulings); the −8 targets only the player, so hexproof creatures are
// still dealt damage.
const PLUS_TEXT = "+1: Chandra deals 2 damage to any target.";
const MINUS_TEXT = "−2: Chandra deals 4 damage to target creature and 2 damage to that creature's controller.";
const ULT_TEXT = "−8: Chandra deals 10 damage to target player and each creature that player controls.";

export default defineCard({
  name: "Chandra, Flame's Fury",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 4, target: 0 },
          { kind: "damage", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 10, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: 10, controlledByTarget: 0 },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
