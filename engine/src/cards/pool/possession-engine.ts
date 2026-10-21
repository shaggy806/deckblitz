import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 10129.

export default defineCard({
  name: "Possession Engine",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: "When this Vehicle enters, gain control of target creature an opponent controls for as long as you control this Vehicle. That creature can't attack or block for as long as you control this Vehicle.\nCrew 3",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
          { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"], duration: "while-you-control-source" },
        ],
      },
      resolve: null,
      text: "When this Vehicle enters, gain control of target creature an opponent controls for as long as you control this Vehicle. That creature can't attack or block for as long as you control this Vehicle.",
    },
  ],
  activated: [crew(3, crewText(3))],
});
