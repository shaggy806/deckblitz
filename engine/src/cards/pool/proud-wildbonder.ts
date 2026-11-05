import { defineCard } from "../define.js";

// Itself too, while it has trample (the ruling).
const TEXT = `Creatures you control with trample have "You may have this creature assign its combat damage as though it weren't blocked."`;

export default defineCard({
  name: "Proud Wildbonder",
  manaCost: "{2}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", keyword: "trample" } },
      assignAsThoughUnblocked: true,
      text: TEXT,
    },
  ],
});
