import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 12987.

export default defineCard({
  name: "Mistmeadow Witch",
  manaCost: "{1}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{2}{W}{U}: Exile target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
  activated: [
    {
      cost: { mana: "{2}{W}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: "{2}{W}{U}: Exile target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
    },
  ],
});
