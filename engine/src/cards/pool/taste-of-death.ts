import { defineCard } from "../define.js";

// EDHREC rank 12548. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] You create three Food tokens, no matter how many creatures were actually
//     sacrificed, even if some or all players sacrificed no creatures.
//   [2019-10-04] As Taste of Death resolves, first the player whose turn it is chooses three
//     creatures they control, then each other player in turn order does the same, knowing the
//     choices made before them. Then all the chosen creatures are sacrificed at the same time.
//
// Barter in Blood's each-player sacrifice, then the Food unconditionally.

export default defineCard({
  name: "Taste of Death",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player sacrifices three creatures of their choice. You create three Food tokens. (They're artifacts with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 3 },
      { kind: "create-token", token: "Food Token", count: 3 },
    ],
  },
});
