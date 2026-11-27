import { defineCard } from "../define.js";

// Legends. EDHREC rank 28125.
//
// Halls of Mist's `attackedDuringControllersLastTurn`, on this creature
// alone: "your last turn" is its controller's (its ruling — taken during an
// opponent's turn after it attacked for them, it can attack on yours).

const TEXT = "This creature can't attack if it attacked during your last turn.";

export default defineCard({
  name: "Giant Turtle",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attackedDuringControllersLastTurn: true } },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
