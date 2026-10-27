import { defineCard } from "../define.js";

export default defineCard({
  name: "Grim Lavamancer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{R}, {T}, Exile two cards from your graveyard: This creature deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{R}", tap: true, exileFromGraveyard: { count: 2 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, {T}, Exile two cards from your graveyard: This creature deals 2 damage to any target.",
    },
  ],
});
