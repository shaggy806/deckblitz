import { defineCard } from "../define.js";

// EDHREC rank 25636.

export default defineCard({
  name: "Surveillance Phantasm",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Illusion"],
  power: 2,
  toughness: 3,
  keywords: ["defender", "flying", "vigilance"],
  text: "Defender, flying, vigilance\nAs long as you've scried or surveilled this turn, this creature can attack as though it didn't have defender.\n{3}{U}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "{3}{U}: Surveil 1.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "scried-or-surveilled", who: "you", atLeast: 1 },
      canAttackAsThoughNoDefender: true,
      text: "As long as you've scried or surveilled this turn, this creature can attack as though it didn't have defender.",
    },
  ],
});
