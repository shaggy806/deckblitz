import { defineCard } from "../define.js";

// EDHREC rank 21540.

export default defineCard({
  name: "Lightning Berserker",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 1,
  dash: { cost: "{R}" },
  text: "{R}: This creature gets +1/+0 until end of turn.\nDash {R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
});
