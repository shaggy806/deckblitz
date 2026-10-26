import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 30429. Mole Worms' ability with Amber
// Prison's untap choice.

const TAP_TEXT =
  "{T}: Tap target land. It doesn't untap during its controller's untap step for as long as this creature remains tapped.";

export default defineCard({
  name: "Mana Leech",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 1,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
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
