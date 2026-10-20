import { defineCard } from "../define.js";

// "Died this way" counts only creatures actually put into a graveyard — not
// an indestructible or regenerated one, nor one Rest in Peace exiles; a token
// does die (it reaches the graveyard first). The target player makes the
// Goblins (`who: "target-controller"`).
export default defineCard({
  name: "Mogg Infestation",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all creatures target player controls. For each creature that died this way, that player creates two 1/1 red Goblin creature tokens.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      {
        kind: "create-token",
        token: "Goblin Token",
        count: { product: [{ thisWay: "died" }, 2] },
        who: "target-controller",
      },
    ],
  },
});
