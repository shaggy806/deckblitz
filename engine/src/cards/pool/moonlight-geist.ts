import { defineCard } from "../define.js";

// EDHREC rank 31386.

export default defineCard({
  name: "Moonlight Geist",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{3}{W}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: "source" }, combat: true },
          { kind: "damage-rule", by: { target: "source" }, combat: true },
        ],
      },
      resolve: null,
      text: "{3}{W}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.",
    },
  ],
});
