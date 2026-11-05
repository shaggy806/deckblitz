import type { CardType } from "../define.js";
import { defineCard } from "../define.js";

// EDHREC rank 10088. Atraxa's `oneEach` over the card types (kindred too: its
// ruling lists it), the picks exiled and the rest milled by the same look. The
// free cast is offered only with four or more exiled; what wasn't cast goes to
// hand, the cast one no longer in exile as the same object.
const CARD_TYPES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
];

export default defineCard({
  name: "Portent of Calamity",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Reveal the top X cards of your library. For each card type, you may exile a card of that type from among them. Put the rest into your graveyard. You may cast a spell from among the exiled cards without paying its mana cost if you exiled four or more cards this way. Then put the rest of the exiled cards into your hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        reveal: true,
        min: 0,
        max: CARD_TYPES.length,
        together: {
          oneEach: CARD_TYPES.map((type) => ({ label: `${/^[aeiou]/.test(type) ? "an" : "a"} ${type} card`, filter: { type } })),
          text: "a card of each card type",
        },
        destination: "exile",
        leftover: "graveyard",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", atLeast: 4 },
        then: { kind: "cast-now", from: "exiled-this-way", free: true },
      },
      { kind: "move-exiled-this-way", to: "hand" },
    ],
  },
});
