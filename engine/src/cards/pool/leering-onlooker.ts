import { defineCard } from "../define.js";

export default defineCard({
  name: "Leering Onlooker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{2}{B}{B}, Exile this card from your graveyard: Create two tapped 1/1 black Bat creature tokens with flying.",
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 2, tapped: true },
      resolve: null,
      text: "{2}{B}{B}, Exile this card from your graveyard: Create two tapped 1/1 black Bat creature tokens with flying.",
      zone: "graveyard",
    },
  ],
});
