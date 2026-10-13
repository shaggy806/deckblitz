import { defineCard } from "../define.js";

// EDHREC rank 8730.
//
// Rulings:
//   [2025-04-04] You can find multicolored cards with Lotuslight Dancers's last ability. For
//     example, the black card you find could be any number of colors as long as black is one of
//     them. Whatever colors it is won't impact what other cards you can find.
//   [2025-04-04] You don't have to find all three cards. You can find two, one, or (if you really
//     want) none.
//
// One find per colour slot (Krosan Verge's `together.oneEach`): a
// multicoloured card fills whichever slot the others leave open.

export default defineCard({
  name: "Lotuslight Dancers",
  manaCost: "{2}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Bard"],
  power: 3,
  toughness: 6,
  keywords: ["lifelink"],
  text: "Lifelink\nWhen this creature enters, search your library for a black card, a green card, and a blue card. Put those cards into your graveyard, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ colors: ["B"] }, { colors: ["G"] }, { colors: ["U"] }] },
        destination: "graveyard",
        min: 0,
        max: 3,
        together: {
          oneEach: [
            { label: "a black card", filter: { colors: ["B"] } },
            { label: "a green card", filter: { colors: ["G"] } },
            { label: "a blue card", filter: { colors: ["U"] } },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, search your library for a black card, a green card, and a blue card. Put those cards into your graveyard, then shuffle.",
    },
  ],
});
