import { defineCard } from "../define.js";

// Champions of Kamigawa. Scourge of Numai's Ogre check, read as the trigger
// resolves (no intervening "if"), with Abhorrent Overlord's sacrifice.

export default defineCard({
  name: "Painwracker Oni",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nAt the beginning of your upkeep, sacrifice a creature if you don't control an Ogre.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Ogre" }, atLeast: 1 } },
        then: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a creature if you don't control an Ogre.",
    },
  ],
});
