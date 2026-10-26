import { defineCard } from "../define.js";
import { haunt } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 25251.
//
// Rulings:
//   [2006-02-01] The mode chosen when this creature enters may be different than the mode chosen
//     when the creature it haunts is put into a graveyard.

export default defineCard({
  name: "Orzhov Pontiff",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Haunt (When this creature dies, exile it haunting target creature.)\nWhen this creature enters or the creature it haunts dies, choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Creatures you don't control get -1/-1 until end of turn.",
  triggered: [
    haunt(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Creatures you control get +1/+1 until end of turn.",
            effect: { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 1, duration: "end-of-turn" },
          },
          {
            text: "Creatures you don't control get -1/-1 until end of turn.",
            effect: { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "opponent" }, power: -1, toughness: -1, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Creatures you don't control get -1/-1 until end of turn.",
    },
    {
      trigger: { on: "haunted-dies" },
      sameAbilityAs: 1,
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Creatures you control get +1/+1 until end of turn.",
            effect: { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 1, duration: "end-of-turn" },
          },
          {
            text: "Creatures you don't control get -1/-1 until end of turn.",
            effect: { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "opponent" }, power: -1, toughness: -1, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Creatures you don't control get -1/-1 until end of turn.",
    },
  ],
});
