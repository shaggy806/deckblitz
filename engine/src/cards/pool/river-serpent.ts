import { defineCard } from "../define.js";

// Amonkhet. The Lion-Turtle's graveyard-count attack restriction; checked as
// attackers are declared, so it stays in combat if the count drops (the ruling).
const TEXT = "This creature can't attack unless there are five or more cards in your graveyard.";

export default defineCard({
  name: "River Serpent",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  cycling: { cost: "{U}" },
  text: `${TEXT}\nCycling {U} ({U}, Discard this card: Draw a card.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 5 } },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
