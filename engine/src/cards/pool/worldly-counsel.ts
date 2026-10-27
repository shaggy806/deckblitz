import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 24090.
//
// Rulings:
//   [2004-10-04] You choose the order on the bottom of your library.
//   [2021-06-18] Domain abilities count the number of basic land types among lands you control,
//     not how many lands you control or how many of any type.

export default defineCard({
  name: "Worldly Counsel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Domain — Look at the top X cards of your library, where X is the number of basic land types among lands you control. Put one of those cards into your hand and the rest on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { basicLandTypes: "you" },
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
