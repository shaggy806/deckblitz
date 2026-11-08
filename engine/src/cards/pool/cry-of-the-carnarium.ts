import { defineCard } from "../define.js";

// The creatures the -2/-2 kills die after this resolves (state-based actions),
// so the turn-long exile replacement set up here takes them too.
export default defineCard({
  name: "Cry of the Carnarium",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "All creatures get -2/-2 until end of turn. Exile all creature cards in all graveyards that were put there from the battlefield this turn. If a creature would die this turn, exile it instead.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
      {
        kind: "exile-graveyard",
        target: "each-player",
        filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
      },
      {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { type: "creature" }, from: "battlefield" },
      },
    ],
  },
});
