import { defineCard } from "../define.js";
import { haunt } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 23229.
// Makes Bat → use "Bat Token".

export default defineCard({
  name: "Belfry Spirit",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nHaunt (When this creature dies, exile it haunting target creature.)\nWhen this creature enters or the creature it haunts dies, create two 1/1 black Bat creature tokens with flying.",
  triggered: [
    haunt(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 2 },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, create two 1/1 black Bat creature tokens with flying.",
    },
    {
      trigger: { on: "haunted-dies" },
      sameAbilityAs: 1,
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 2 },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, create two 1/1 black Bat creature tokens with flying.",
    },
  ],
});
