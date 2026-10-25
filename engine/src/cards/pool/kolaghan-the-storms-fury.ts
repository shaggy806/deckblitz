import { defineCard } from "../define.js";

// EDHREC rank 6948.

export default defineCard({
  name: "Kolaghan, the Storm's Fury",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  dash: { cost: "{3}{B}{R}" },
  text: "Flying\nWhenever a Dragon you control attacks, creatures you control get +1/+0 until end of turn.\nDash {3}{B}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever a Dragon you control attacks, creatures you control get +1/+0 until end of turn.",
    },
  ],
});
