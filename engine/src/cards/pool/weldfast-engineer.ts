import { defineCard } from "../define.js";

export default defineCard({
  name: "Weldfast Engineer",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: "At the beginning of combat on your turn, target artifact creature you control gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "At the beginning of combat on your turn, target artifact creature you control gets +2/+0 until end of turn.",
    },
  ],
});
