import { defineCard } from "../define.js";

const TEXT = "When Khan enters, he deals 1 damage to each opponent and each creature your opponents control.";

export default defineCard({
  name: "Khan, Despot by Design",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // One instruction: dealt at once (Sarkhan, Dragonsoul's shape).
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
