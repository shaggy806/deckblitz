import { defineCard } from "../define.js";

// Each player from the active player chooses, knowing the choices before theirs
// (rule 101.4); every unchosen creature is sacrificed at once; then the Treasures
// are counted, off what's left.
export default defineCard({
  name: "Covetous Elegy",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text:
    "Each player chooses up to two creatures they control, then sacrifices the rest. " +
    "Then you create a tapped Treasure token for each creature your opponents control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-all-but", who: "each-player", keep: 2, upTo: true, filter: { type: "creature" } },
      {
        kind: "create-token",
        token: "Treasure Token",
        count: { countOf: { type: "creature", controlledBy: "opponent" } },
        tapped: true,
      },
    ],
  },
});
