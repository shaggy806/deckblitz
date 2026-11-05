import { defineCard } from "../define.js";

// EDHREC rank 31160.

export default defineCard({
  name: "Zombie Scavengers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 1,
  text: "Exile the top creature card of your graveyard: Regenerate this creature.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        exileFromGraveyard: { count: 1, filter: { type: "creature" }, fromTop: true },
      },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Exile the top creature card of your graveyard: Regenerate this creature.",
    },
  ],
});
