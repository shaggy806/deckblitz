import { defineCard } from "../define.js";

// EDHREC rank 24584. Armed Assailant's condition, without the bonus.

const TEXT = "As long as this creature is equipped, it has menace.";

export default defineCard({
  name: "Armory Veteran",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (It can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { equipped: true } },
      grantKeywords: ["menace"],
      text: TEXT,
    },
  ],
});
