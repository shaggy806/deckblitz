import { defineCard } from "../define.js";

// "Was cast this turn": it entered this turn as a spell that was cast
// (`cast` is this stint's own record), so a flickered Rock Jockey doesn't count.
export default defineCard({
  name: "Rock Jockey",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  text: "You can't cast Rock Jockey if you've played a land this turn.\nYou can't play lands if this creature was cast this turn.",
  castOnlyIf: { kind: "not", of: { kind: "turn-history", what: "lands-played", atLeast: 1 } },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { cast: true, enteredThisTurn: true } },
      prohibits: [{ act: "play-land", who: "you" }],
      text: "You can't play lands if this creature was cast this turn.",
    },
  ],
});
