import { defineCard } from "../define.js";

// EDHREC rank 22463. The Skaabs' additional cost (`additionalCost.exileFromGraveyard`),
// and Merfolk Pupil's graveyard ability (its own exile is the `zone: "graveyard"` cost).

export default defineCard({
  name: "Cobbled Lancer",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horse"],
  power: 3,
  toughness: 3,
  text: "As an additional cost to cast this spell, exile a creature card from your graveyard.\n{3}{U}, Exile this card from your graveyard: Draw a card.",
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{3}{U}, Exile this card from your graveyard: Draw a card.",
      zone: "graveyard",
    },
  ],
});
