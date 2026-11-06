import { defineCard } from "../define.js";

export default defineCard({
  name: "Spock, Logical Choice",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Human", "Scientist"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\n{T}: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}: Draw a card.",
    },
  ],
});
