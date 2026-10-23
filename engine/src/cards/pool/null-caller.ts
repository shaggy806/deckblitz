import { defineCard } from "../define.js";

const TEXT = "{3}{B}, Exile a creature card from your graveyard: Create a tapped 2/2 black Zombie creature token.";

export default defineCard({
  name: "Null Caller",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
