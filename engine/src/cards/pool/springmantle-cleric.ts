import { defineCard } from "../define.js";

// EDHREC rank 28929. Zendikar Rising. Crystalline Crawler's converge counters:
// colours actually spent (colourless isn't one), none if it wasn't cast (the
// rulings).

const TEXT = "This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";

export default defineCard({
  name: "Springmantle Cleric",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } },
      },
      text: TEXT,
    },
  ],
});
