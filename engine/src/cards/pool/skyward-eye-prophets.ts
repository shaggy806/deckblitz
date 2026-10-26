import { defineCard } from "../define.js";

// EDHREC rank 25224.

const TEXT =
  "{T}: Reveal the top card of your library. If it's a land card, put it onto the battlefield. Otherwise, put it into your hand.";

export default defineCard({
  name: "Skyward Eye Prophets",
  manaCost: "{3}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        destination: "battlefield",
        leftover: "hand",
        filter: { type: "land" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
