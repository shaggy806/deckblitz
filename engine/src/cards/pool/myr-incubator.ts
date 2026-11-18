import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 15977.
//
// The search exiles what it finds (`destination: "exile"`), and "that many" is the number of
// cards exiled this way (`thisWay: "exiled"`). The library is shuffled as the search ends; the
// tokens' creation and the shuffle touch nothing of each other's.
const TEXT =
  "{6}, {T}, Sacrifice this artifact: Search your library for any number of artifact cards, exile them, then create that many 1/1 colorless Myr artifact creature tokens. Then shuffle.";

export default defineCard({
  name: "Myr Incubator",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: { type: "artifact" }, destination: "exile", min: 0, max: { librarySize: "you" } },
          { kind: "create-token", token: "Myr Token", count: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
