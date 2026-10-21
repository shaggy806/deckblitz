import { defineCard } from "../define.js";

const GRANTED_TEXT = "{2}: Untap this creature.";

export default defineCard({
  name: "Scuttling Sliver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver", "Trilobite"],
  power: 2,
  toughness: 2,
  text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false },
          targets: [],
          effect: { kind: "untap", target: "source" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
