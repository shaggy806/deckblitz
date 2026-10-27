import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 32138. Gearsmith Guardian's shape, twice: "a white creature"
// counts this one too, should it become white (`countsSelf`).
const WHITE = "This creature gets +1/+1 as long as you control a white creature.";
const BLUE = "This creature gets +1/+1 as long as you control a blue creature.";

export default defineCard({
  name: "Minotaur Tactician",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${WHITE}\n${BLUE}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["W"] }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: WHITE,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["U"] }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: BLUE,
    },
  ],
});
