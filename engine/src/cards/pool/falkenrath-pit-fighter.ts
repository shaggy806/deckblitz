import { defineCard } from "../define.js";

const TEXT =
  "{1}{R}, Discard a card, Sacrifice a Vampire: Draw two cards. Activate only if an opponent lost life this turn.";

export default defineCard({
  name: "Falkenrath Pit Fighter",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      // "A Vampire" can be this creature itself.
      cost: { mana: "{1}{R}", tap: false, discard: { count: 1 }, sacrifice: { filter: { subtype: "Vampire" } } },
      // Lost any life this turn, even with life gained since (its ruling).
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
