import { defineCard } from "../define.js";

const TEXT =
  "Soulless One's power and toughness are each equal to the number of Zombies on the battlefield plus the number of Zombie cards in all graveyards.";

// EDHREC rank 13518.
export default defineCard({
  name: "Soulless One",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Avatar"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "count", filter: { subtype: "Zombie" }, plus: [{ filter: { subtype: "Zombie" }, in: "graveyards" }] },
        plusPower: 0,
        plusToughness: 0,
      },
      text: TEXT,
    },
  ],
});
