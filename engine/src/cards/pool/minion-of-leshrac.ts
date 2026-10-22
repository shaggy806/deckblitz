import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 24057.
//
// Rulings:
//   [2008-10-01] If you don’t sacrifice a creature at the beginning of your upkeep (either by
//     choice or because you can’t), but you somehow prevent all the damage Minion of Leshrac would
//     deal to you, then you don’t tap Minion of Leshrac.
//   [2008-10-01] Minion of Leshrac can’t target itself with its activated ability because it has
//     protection from black.
//
// The Gitrog Monster's "unless you sacrifice" shape (`unless`, chooser
// "you"), the option offered only with another creature to sacrifice. The
// tap waits on damage actually dealt this way, after prevention (the first
// ruling).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, this creature deals 5 damage to you unless you sacrifice a creature other than this creature. If this creature deals damage to you this way, tap it.";

export default defineCard({
  name: "Minion of Leshrac",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Minion"],
  power: 5,
  toughness: 5,
  text: `Protection from black\n${UPKEEP_TEXT}\n{T}: Destroy target creature or land.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target creature or land.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice a creature other than Minion of Leshrac" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 5, who: "you" },
            {
              kind: "conditional",
              condition: { kind: "damage-dealt-this-way", player: true },
              then: { kind: "tap", target: "source" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
