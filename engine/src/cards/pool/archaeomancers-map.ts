import { defineCard } from "../define.js";

// EDHREC rank 690.
//
// Rulings:
//   [2021-04-16] The last ability triggers only if that opponent controls more lands than you
//     after the land enters the battlefield. The ability will check again as it tries to resolve.
//     If that opponent doesn't still control more lands than you at that time, the ability won't
//     resolve.

export default defineCard({
  name: "Archaeomancer's Map",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "When this artifact enters, search your library for up to two basic Plains cards, reveal them, put them into your hand, then shuffle.\nWhenever a land an opponent controls enters, if that player controls more lands than you, you may put a land card from your hand onto the battlefield.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtype: "Plains" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 2,
      },
      resolve: null,
      text: "When this artifact enters, search your library for up to two basic Plains cards, reveal them, put them into your hand, then shuffle.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "land", controlledBy: "opponent" },
      },
      // "That player" is who the land entered under, not any opponent, and it
      // counts the land itself (the ruling). Asked again as it resolves (603.4).
      condition: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "fewer", than: "that-player" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: "Whenever a land an opponent controls enters, if that player controls more lands than you, you may put a land card from your hand onto the battlefield.",
    },
  ],
});
