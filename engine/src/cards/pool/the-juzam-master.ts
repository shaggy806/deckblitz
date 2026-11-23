import { defineCard } from "../define.js";

const TEXT =
  'Creatures you control get +1/+0 and have "At the beginning of your upkeep, this creature deals 1 damage to you."';

export default defineCard({
  name: "The Juzam Master",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantPt: [1, 0],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "damage", amount: 1, who: "you" },
          resolve: null,
          text: "At the beginning of your upkeep, this creature deals 1 damage to you.",
        },
      ],
      text: TEXT,
    },
  ],
});
