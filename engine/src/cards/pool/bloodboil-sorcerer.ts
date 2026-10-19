import { defineCard } from "../define.js";

// EDHREC rank 13963.

export default defineCard({
  name: "Bloodboil Sorcerer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Sorcerer"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you take the initiative.\nCrown of Madness — {1}{R}, Sacrifice an artifact or creature: Goad target creature. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)",
  activated: [
    {
      cost: {
        mana: "{1}{R}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: ["creature"],
      effect: { kind: "goad", target: 0 },
      resolve: null,
      text: "Crown of Madness — {1}{R}, Sacrifice an artifact or creature: Goad target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
  ],
});
