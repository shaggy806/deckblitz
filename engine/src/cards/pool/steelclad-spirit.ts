import { defineCard } from "../define.js";

// EDHREC rank 29433. Stalked Researcher's eerie trigger, without the Room half.
const TEXT =
  "Whenever an enchantment you control enters, this creature can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Steelclad Spirit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
