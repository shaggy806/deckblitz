import { defineCard } from "../define.js";

// EDHREC rank 16021.
//
// Rulings:
//   Untapped creatures you control can't be untapped again, but those creatures
//   still gain hexproof and indestructible.

export default defineCard({
  name: "Join Shields",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Untap all creatures you control. They gain hexproof and indestructible until end of turn. (They can't be the targets of spells or abilities your opponents control. Damage and effects that say \"destroy\" don't destroy them.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "hexproof",
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
    ],
  },
});
