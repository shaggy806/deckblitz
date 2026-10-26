import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] The player must be poisoned when Viridian Betrayers deals damage in order for
//     Viridian Betrayers to have infect.
//   [2011-06-01] A player is poisoned if that player has one or more poison counters.

export default defineCard({
  name: "Viridian Betrayers",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Warrior"],
  power: 3,
  toughness: 1,
  text: "This creature has infect as long as an opponent is poisoned. (It deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 1 },
      grantKeywords: ["infect"],
      text: "This creature has infect as long as an opponent is poisoned.",
    },
  ],
});
