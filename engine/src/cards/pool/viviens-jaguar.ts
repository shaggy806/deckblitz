import { defineCard } from "../define.js";

const TEXT =
  "{2}{G}: Return this card from your graveyard to your hand. Activate only if you control a Vivien planeswalker.";

export default defineCard({
  name: "Vivien's Jaguar",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Vivien" }, atLeast: 1 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
