import { defineCard } from "../define.js";

const TEXT =
  "{T}: Look at the top card of your library. If it's a land card, you may reveal it and put it into your hand.";

export default defineCard({
  name: "Dryad Greenseeker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
