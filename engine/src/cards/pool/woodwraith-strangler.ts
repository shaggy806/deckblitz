import { defineCard } from "../define.js";

export default defineCard({
  name: "Woodwraith Strangler",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Zombie"],
  power: 2,
  toughness: 2,
  text: "Exile a creature card from your graveyard: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Exile a creature card from your graveyard: Regenerate this creature.",
    },
  ],
});
