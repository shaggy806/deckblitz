import { defineCard } from "../define.js";

const TEXT = "{2}{B}, Exile a creature card from your graveyard: Create a tapped 2/2 black Zombie creature token.";

export default defineCard({
  name: "Graveyard Marshal",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
