import { defineCard } from "../define.js";

// EDHREC rank 30287. The searches "for each card exiled this way" are one
// search of the library (rule 701.23h), for every name exiled, and any may
// be left there (the ruling) — the library is hidden, so no `all`.

export default defineCard({
  name: "Haunting Echoes",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile all cards from target player's graveyard other than basic land cards. For each card exiled this way, search that player's library for all cards with the same name as that card and exile them. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "exile-graveyard",
        target: 0,
        filter: { anyOf: [{ notTypes: ["land"] }, { notSupertype: "basic" }] },
      },
      {
        kind: "search-library",
        whose: { target: 0 },
        filter: { sameNameAsThisWay: "exiled" },
        destination: "exile",
        min: 0,
        max: 99,
      },
    ],
  },
});
