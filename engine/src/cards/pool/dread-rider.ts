import { defineCard } from "../define.js";

export default defineCard({
  name: "Dread Rider",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 3,
  toughness: 7,
  text: "{1}{B}, {T}, Exile a creature card from your graveyard: Target opponent loses 3 life.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 3, target: 0 },
      resolve: null,
      text: "{1}{B}, {T}, Exile a creature card from your graveyard: Target opponent loses 3 life.",
    },
  ],
});
