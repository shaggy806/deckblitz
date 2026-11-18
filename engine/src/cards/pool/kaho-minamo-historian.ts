import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 18512.
//
// Rulings:
//   Kaho's activated ability refers only to cards exiled by its triggered ability. If another
//     effect exiled the cards, you won't be able to use Kaho to cast those cards.
//   If an effect takes a card Kaho exiled out of the exile zone, then you can't use Kaho's
//     ability to cast that card.
//   If another player gains control of Kaho, that player may cast any of the cards exiled with
//     Kaho's ability.
//
// The search exiles its finds linked to Kaho (rule 607.2a, `linked`), and the activated ability
// casts from those alone (`from: "exiled-with-source"`), whoever controls Kaho then. "A spell
// with mana value X" is the spell as it would be cast (`spell`), X the ability's.
const ENTER_TEXT = "When Kaho enters, search your library for up to three instant cards, exile them, then shuffle.";
const CAST_TEXT =
  "{X}, {T}: You may cast a spell with mana value X from among cards exiled with Kaho without paying its mana cost.";

export default defineCard({
  name: "Kaho, Minamo Historian",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "search-library", filter: { type: "instant" }, destination: "exile", min: 0, max: 3, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "exiled-with-source",
        spell: { manaValue: { op: "eq", n: "x" } },
        free: true,
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
