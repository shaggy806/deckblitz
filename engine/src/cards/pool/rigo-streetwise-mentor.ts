import { defineCard } from "../define.js";

// EDHREC rank 14184.

export default defineCard({
  name: "Rigo, Streetwise Mentor",
  manaCost: "{G/W}{W}{W/U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Citizen"],
  power: 2,
  toughness: 2,
  text: "Rigo enters with a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\nWhenever you attack a player or planeswalker with one or more creatures with power 1 or less, draw a card.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "Rigo enters with a shield counter on it.",
    },
  ],
  triggered: [
    {
      // A creature attacking a battle doesn't count: "a player or planeswalker".
      trigger: {
        on: "attack-with",
        who: "you",
        atLeast: 1,
        filter: { type: "creature", power: { op: "lte", n: 1 }, attackingBattle: false },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you attack a player or planeswalker with one or more creatures with power 1 or less, draw a card.",
    },
  ],
});
