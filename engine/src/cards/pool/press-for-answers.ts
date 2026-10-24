import { defineCard } from "../define.js";

export default defineCard({
  name: "Press for Answers",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature. It doesn't untap during its controller's next untap step.\nInvestigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "create-token", token: "Clue Token", count: 1 },
    ],
  },
});
