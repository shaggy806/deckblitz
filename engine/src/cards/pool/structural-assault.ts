import { defineCard } from "../define.js";

// Streets of New Capenna (SNC). EDHREC rank 14039. The damage counts every
// artifact put into a graveyard from the battlefield this turn, for any
// reason (the ruling) — tokens too, each as it last existed there — read
// after the destruction: the turn history's `to-graveyard` lists of every
// player, `from: ["battlefield"]`.

export default defineCard({
  name: "Structural Assault",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all artifacts, then Structural Assault deals damage to each creature equal to the number of artifacts that were put into graveyards from the battlefield this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "artifact" } },
      {
        kind: "damage-all",
        amount: {
          turnHistory: "to-graveyard",
          who: "each-player",
          from: ["battlefield"],
          filter: { type: "artifact" },
        },
        filter: { type: "creature" },
      },
    ],
  },
});
