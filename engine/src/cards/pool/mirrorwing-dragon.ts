import { defineCard } from "../define.js";

// Zada's copies, made by whoever cast the spell: theirs, in the order they
// choose, aimed at creatures they control, wherever Mirrorwing itself is.

const TEXT =
  "Whenever a player casts an instant or sorcery spell that targets only this creature, that player copies that spell for each other creature they control that the spell could target. Each copy targets a different one of those creatures.";

export default defineCard({
  name: "Mirrorwing Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "any",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { only: true, source: true } },
      },
      targets: [],
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        controller: "trigger-controller",
        forEachItCouldTarget: { filter: { type: "creature", controlledBy: "you" }, other: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
