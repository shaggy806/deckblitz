import { defineCard } from "../define.js";

const ENTERS =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's untap step for as long as you control this creature.";
const TAX = "Spells your opponents cast that target this creature cost {2} more to cast.";

export default defineCard({
  name: "Icefall Regent",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${TAX}`,
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
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "self" }, targetedBySpellsCost: { payGeneric: 2 }, text: TAX }],
});
