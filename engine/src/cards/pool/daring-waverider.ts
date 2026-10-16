import { defineCard } from "../define.js";

// EDHREC rank 9143. Bloomburrow.
//
// Victor Timely's free cast from the graveyard, instants and sorceries only:
// cast while the trigger resolves or not at all, X as 0, mandatory additional
// costs still paid, and exiled if it would go to the graveyard — countered
// included (the rulings).
const TEXT =
  "When this creature enters, you may cast target instant or sorcery card with mana value 4 or less from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Daring Waverider",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Otter", "Wizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 4 } },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
