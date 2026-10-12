import { defineCard } from "../define.js";

// EDHREC rank 7744.
//
// Rulings:
//   [2025-10-02] For Kyoshi Island Plaza's first ability, the number of Shrines you control is
//     checked when the ability resolves. You will still search and shuffle your library if you
//     control no Shrines when the ability resolves, but you won't get any lands.

export default defineCard({
  name: "Kyoshi Island Plaza",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Shrine"],
  text: "When Kyoshi Island Plaza enters, search your library for up to X basic land cards, where X is the number of Shrines you control. Put those cards onto the battlefield tapped, then shuffle.\nWhenever another Shrine you control enters, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // X is counted as it resolves (the ruling) — you search and shuffle
      // even with none.
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        min: 0,
        max: { countOf: { subtype: "Shrine", controlledBy: "you" } },
        destination: "battlefield",
        enterTapped: true,
      },
      resolve: null,
      text: "When Kyoshi Island Plaza enters, search your library for up to X basic land cards, where X is the number of Shrines you control. Put those cards onto the battlefield tapped, then shuffle.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Shrine" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: "Whenever another Shrine you control enters, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    },
  ],
});
