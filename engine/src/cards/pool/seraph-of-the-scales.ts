import { defineCard } from "../define.js";

// EDHREC rank 15118.
// Makes Spirit → use "Spirit Token (White-Black)".

export default defineCard({
  name: "Seraph of the Scales",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{W}: This creature gains vigilance until end of turn.\n{B}: This creature gains deathtouch until end of turn.\nAfterlife 2 (When this creature dies, create two 1/1 white and black Spirit creature tokens with flying.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "vigilance",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}: This creature gains vigilance until end of turn.",
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{B}: This creature gains deathtouch until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 2 },
      resolve: null,
      text: "Afterlife 2 (When this creature dies, create 2 1/1 white and black Spirit creature tokens with flying.)",
    },
  ],
});
