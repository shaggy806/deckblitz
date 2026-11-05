import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, destroy all Walls your opponents control.";
const ATTACKS = "Whenever this creature attacks, if defending player controls no Walls, it deals 2 damage to each creature without flying that player controls.";

export default defineCard({
  name: "Siege Dragon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { subtype: "Wall", controlledBy: "opponent" } },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Wall" }, atLeast: 1 } },
      },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", notKeyword: "flying" },
        amount: 2,
        whose: "trigger-player",
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
