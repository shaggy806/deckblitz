import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's untap step for as long as you control this creature.";

export default defineCard({
  name: "Dungeon Geists",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
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
