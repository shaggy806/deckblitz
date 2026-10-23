import { defineCard } from "../define.js";

const TEXT = "When this creature deals combat damage to a player, transform it.";

export default defineCard({
  name: "Uninvited Geist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["skulk"],
  text: `Skulk (This creature can't be blocked by creatures with greater power.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Uninvited Geist", "Unimpeded Trespasser"],
  transform: true,
});
