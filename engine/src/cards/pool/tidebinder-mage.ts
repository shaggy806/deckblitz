import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, tap target red or green creature an opponent controls. That creature doesn't untap during its controller's untap step for as long as you control this creature.";

export default defineCard({
  name: "Tidebinder Mage",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-you-control-source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
