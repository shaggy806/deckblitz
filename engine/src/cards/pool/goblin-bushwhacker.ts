import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, if it was kicked, creatures you control get +1/+0 and gain haste until end of turn.";

// Only the creatures you control as it resolves (the ruling).
export default defineCard({
  name: "Goblin Bushwhacker",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  kicker: { cost: "{R}" },
  text: `Kicker {R} (You may pay an additional {R} as you cast this spell.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
