import { defineCard } from "../define.js";

const ATTACK_TEXT = "Attacking creatures you control get +1/+0.";

export default defineCard({
  name: "Instigator Gang",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 3,
  text: `${ATTACK_TEXT}\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Instigator Gang", "Wildblood Pack"],
  transform: true,
});
