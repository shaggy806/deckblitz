import { defineCard } from "../define.js";

const TEXT = "{T}: Tap target creature with flying blocked by this creature. That creature doesn't untap during its controller's untap step for as long as this creature remains tapped.";

export default defineCard({
  name: "Whip Vine",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 1,
  toughness: 4,
  keywords: ["defender", "reach"],
  text: `Defender; reach (This creature can block creatures with flying.)\nYou may choose not to untap this creature during your untap step.\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying", blockingRelation: { relation: "blocked-by" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this creature during your untap step.",
    },
  ],
});
