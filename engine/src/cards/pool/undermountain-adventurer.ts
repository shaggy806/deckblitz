import { defineCard } from "../define.js";

// EDHREC rank 11015.

export default defineCard({
  name: "Undermountain Adventurer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, you take the initiative.\n{T}: Add {G}{G}. If you've completed a dungeon, add six {G} instead.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: { ifCondition: { kind: "completed-dungeon" }, then: 6, else: 2 },
      },
      resolve: null,
      text: "{T}: Add {G}{G}. If you've completed a dungeon, add six {G} instead.",
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
