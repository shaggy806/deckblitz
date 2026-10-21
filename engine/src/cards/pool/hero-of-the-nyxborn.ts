import { defineCard } from "../define.js";

export default defineCard({
  name: "Hero of the Nyxborn",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a 1/1 white Human Soldier creature token.\nWhenever you cast a spell that targets this creature, creatures you control get +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white Human Soldier creature token.",
    },
    {
      // Heroic: only the creatures you control as it resolves (its ruling).
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever you cast a spell that targets this creature, creatures you control get +1/+0 until end of turn.",
    },
  ],
});
