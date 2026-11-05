import { defineCard } from "../define.js";

const EXILE = "At the beginning of each end step, if you were dealt 4 or more damage this turn, exile this artifact.";

export default defineCard({
  name: "Boarded Window",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `Creatures attacking you get -1/-0.\n${EXILE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "damage-taken", who: "you", atLeast: 4 },
      targets: [],
      effect: { kind: "exile", target: "source" },
      resolve: null,
      text: EXILE,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackingYou: true } },
      grantPt: [-1, 0],
      text: "Creatures attacking you get -1/-0.",
    },
  ],
});
