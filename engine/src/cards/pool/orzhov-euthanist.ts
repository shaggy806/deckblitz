import { defineCard } from "../define.js";
import { haunt } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 26440.

export default defineCard({
  name: "Orzhov Euthanist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 2,
  text: "Haunt (When this creature dies, exile it haunting target creature.)\nWhen this creature enters or the creature it haunts dies, destroy target creature that was dealt damage this turn.",
  triggered: [
    haunt(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, destroy target creature that was dealt damage this turn.",
    },
    {
      trigger: { on: "haunted-dies" },
      sameAbilityAs: 1,
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, destroy target creature that was dealt damage this turn.",
    },
  ],
});
