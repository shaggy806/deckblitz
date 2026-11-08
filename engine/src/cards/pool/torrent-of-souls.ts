import { defineCard } from "../define.js";

// EDHREC rank 18683. Both targets are chosen whatever is spent; the colours
// spent on the whole cost are read as it resolves (its rulings). A creature
// the first half returns under the target player's control gets the second.

export default defineCard({
  name: "Torrent of Souls",
  manaCost: "{4}{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Return up to one target creature card from your graveyard to the battlefield if {B} was spent to cast this spell. Creatures target player controls get +2/+0 and gain haste until end of turn if {R} was spent to cast this spell. (Do both if {B}{R} was spent.)",
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }, "player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "B", amount: { op: "gte", n: 1 } }] } },
        then: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "R", amount: { op: "gte", n: 1 } }] } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 2,
              toughness: 0,
              duration: "end-of-turn",
              controlledByTarget: 1,
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "haste",
              duration: "end-of-turn",
              controlledByTarget: 1,
            },
          ],
        },
      },
    ],
  },
});
