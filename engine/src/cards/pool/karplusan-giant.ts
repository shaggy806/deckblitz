import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31723.

const TEXT = "Tap an untapped snow land you control: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Karplusan Giant",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "land", supertype: "snow", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
