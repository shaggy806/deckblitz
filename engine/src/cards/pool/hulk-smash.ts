import { defineCard } from "../define.js";

const TEXT =
  "Teamwork 4 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 4 or more.)\n" +
  "Choose one. If this spell was cast using teamwork, choose both instead.\n" +
  "• Destroy target noncreature artifact.\n" +
  "• Target creature you control deals damage equal to its power to target creature an opponent controls.";

export default defineCard({
  name: "HULK SMASH!",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "", keyword: "teamwork", teamwork: 4 },
  text: TEXT,
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Destroy target noncreature artifact.",
        targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target creature you control deals damage equal to its power to target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      },
    ],
  },
});
