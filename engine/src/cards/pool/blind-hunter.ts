import { defineCard } from "../define.js";
import { haunt } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 18463.

export default defineCard({
  name: "Blind Hunter",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nHaunt (When this creature dies, exile it haunting target creature.)\nWhen this creature enters or the creature it haunts dies, target player loses 2 life and you gain 2 life.",
  triggered: [
    haunt(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, target player loses 2 life and you gain 2 life.",
    },
    {
      trigger: { on: "haunted-dies" },
      sameAbilityAs: 1,
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, target player loses 2 life and you gain 2 life.",
    },
  ],
});
