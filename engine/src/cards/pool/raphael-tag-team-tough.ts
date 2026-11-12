import { defineCard } from "../define.js";

// EDHREC rank 10301. "For the first time each turn" is the timing wrapper,
// counted per creature from the journal's combat damage to players (B308).
export default defineCard({
  name: "Raphael, Tag Team Tough",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 5,
  toughness: 6,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever Raphael deals combat damage to a player for the first time each turn, untap all attacking creatures. After this combat phase, there is an additional combat phase.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", attacking: true } },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: "Whenever Raphael deals combat damage to a player for the first time each turn, untap all attacking creatures. After this combat phase, there is an additional combat phase.",
    },
  ],
});
