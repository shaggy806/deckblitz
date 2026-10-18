import { defineCard } from "../define.js";

// EDHREC rank 25078. March of the Machine.

const TEXT = "Whenever this creature attacks a battle, double its power until end of turn.";

export default defineCard({
  name: "War-Trained Slasher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolverine", "Dinosaur"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defender: "battle" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source", doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
