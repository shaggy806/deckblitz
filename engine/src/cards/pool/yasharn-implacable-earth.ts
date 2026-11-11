import { defineCard } from "../define.js";

// EDHREC rank 5571.
//
// Rulings:
//   [2020-09-25] Other things may still cause players to pay life or sacrifice creatures, such as
//     a resolving spell or ability.
//   [2020-09-25] If a spell or activated ability has a cost that requires a player to pay life or
//     sacrifice a permanent, that spell or ability can't be cast or activated.
//   [2020-09-25] Yasharn's first ability can find just one basic Forest or one basic Plains card
//     if you don't have both in your library or if you don't wish to find both.
const SEARCH_TEXT =
  "When Yasharn enters, search your library for a basic Forest card and a basic Plains card, reveal those cards, put them into your hand, then shuffle.";
const CANT_TEXT = "Players can't pay life or sacrifice nonland permanents to cast spells or activate abilities.";

export default defineCard({
  name: "Yasharn, Implacable Earth",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Boar"],
  power: 4,
  toughness: 4,
  text: `${SEARCH_TEXT}\n${CANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtypes: ["Forest", "Plains"] },
        destination: "hand",
        min: 0,
        max: 2,
        reveal: true,
        together: {
          oneEach: [
            { label: "a basic Forest card", filter: { supertype: "basic", subtype: "Forest" } },
            { label: "a basic Plains card", filter: { supertype: "basic", subtype: "Plains" } },
          ],
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "pay-life", who: "each-player" },
        { act: "sacrifice-for-cost", who: "each-player", filter: { notTypes: ["land"] } },
      ],
      text: CANT_TEXT,
    },
  ],
});
