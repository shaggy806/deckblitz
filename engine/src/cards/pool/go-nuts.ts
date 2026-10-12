import { defineCard } from "../define.js";

const TEXT =
  "Teamwork 3 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 3 or more.)\n" +
  "Choose one. If this spell was cast using teamwork, choose both instead.\n" +
  "• Put a +1/+1 counter on target creature.\n" +
  "• Target creature you control fights target creature an opponent controls.";

export default defineCard({
  name: "Go Nuts!",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "teamwork", teamwork: 3 },
  text: TEXT,
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Put a +1/+1 counter on target creature.",
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      {
        text: "Target creature you control fights target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
      },
    ],
  },
});
