import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 18743.

const TEXT = "{U}{U}, {T}: Create a 0/1 blue Plant Wall creature token with defender named Kelp.";

export default defineCard({
  name: "Wall of Kelp",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Kelp Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
