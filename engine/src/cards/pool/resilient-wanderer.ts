import { defineCard } from "../define.js";

// EDHREC rank 30946.

const TEXT = "Discard a card: This creature gains protection from the color of your choice until end of turn.";

export default defineCard({
  name: "Resilient Wanderer",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-protection", target: "source", from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
