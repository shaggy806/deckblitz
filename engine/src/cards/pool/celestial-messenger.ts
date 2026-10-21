import { defineCard } from "../define.js";

export default defineCard({
  name: "Celestial Messenger",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: "Flash (You may cast this card any time you could cast an instant.)\nFlying\nThis creature gets +1/+1 as long as you control a Yanling planeswalker.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Yanling" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Yanling planeswalker.",
    },
  ],
});
