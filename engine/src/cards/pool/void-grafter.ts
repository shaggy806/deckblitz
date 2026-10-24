import { defineCard } from "../define.js";

// EDHREC rank 16283.
const TEXT = "When this creature enters, another target creature you control gains hexproof until end of turn.";

export default defineCard({
  name: "Void Grafter",
  manaCost: "{1}{G}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 4,
  keywords: ["flash"],
  text: `Devoid (This card has no color.)\nFlash (You may cast this spell any time you could cast an instant.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
