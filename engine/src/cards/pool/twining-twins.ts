import { defineCard } from "../define.js";

// EDHREC rank 12345. Wilds of Eldraine. Adventure: Swift Spiral.

export default defineCard({
  name: "Twining Twins",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance, ward {1}",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
  ],
  faces: ["Twining Twins", "Swift Spiral"],
  adventure: true,
});
