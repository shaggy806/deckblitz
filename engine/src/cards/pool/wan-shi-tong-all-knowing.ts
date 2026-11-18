import { defineCard } from "../define.js";

// EDHREC rank 13881.
//
// "One or more cards are put into a library from anywhere" is the
// `put-into-library` trigger event, `batched`: once per simultaneous move of
// cards into libraries from other zones (`cards-put-into-library`), whoever's
// libraries — its own enters trigger tucking a permanent included.
//
// Rulings:
//   Wan Shi Tong, All-Knowing's last ability triggers only when cards are put
//   into a library from somewhere other than the library. It won't trigger
//   when you scry, surveil, or otherwise reorder cards in your library.

export default defineCard({
  name: "Wan Shi Tong, All-Knowing",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text:
    "Flying\n" +
    "When Wan Shi Tong enters, target nonland permanent's owner puts it into their library second from the top or on the bottom.\n" +
    'Whenever one or more cards are put into a library from anywhere, create two 1/1 colorless Spirit creature tokens with "This token can\'t block or be blocked by non-Spirit creatures."',
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent"],
      effect: { kind: "put-on-library", target: 0, position: { ownerChooses: [{ fromTop: 2 }, "bottom"] } },
      resolve: null,
      text: "When Wan Shi Tong enters, target nonland permanent's owner puts it into their library second from the top or on the bottom.",
    },
    {
      trigger: { on: "event", event: "put-into-library", batched: true },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless, Evasive)", count: 2 },
      resolve: null,
      text: 'Whenever one or more cards are put into a library from anywhere, create two 1/1 colorless Spirit creature tokens with "This token can\'t block or be blocked by non-Spirit creatures."',
    },
  ],
});
