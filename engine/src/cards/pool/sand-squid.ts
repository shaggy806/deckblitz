import { defineCard } from "../define.js";

const TAP_TEXT =
  "{T}: Tap target creature. That creature doesn't untap during its controller's untap step for as long as this creature remains tapped.";

export default defineCard({
  name: "Sand Squid",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Squid", "Beast"],
  power: 2,
  toughness: 2,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\nYou may choose not to untap this creature during your untap step.\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
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
