import { defineCard } from "../define.js";

// EDHREC rank 6259.

export default defineCard({
  name: "Tomb of Horrors Adventurer",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elf", "Monk"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, you take the initiative.\nWhenever you cast your second spell each turn, copy it. If you've completed a dungeon, copy that spell twice instead. You may choose new targets for the copies. (A copy of a permanent spell becomes a token.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      // Whether you've completed a dungeon is read as it resolves.
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        newTargets: true,
        count: { ifCondition: { kind: "completed-dungeon" }, then: 2, else: 1 },
      },
      resolve: null,
      text: "Whenever you cast your second spell each turn, copy it. If you've completed a dungeon, copy that spell twice instead. You may choose new targets for the copies.",
    },
  ],
});
