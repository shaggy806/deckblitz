import { defineCard } from "../define.js";

// - The sacrifice is the spell's effect, not a cost (ruling): it happens as
//   it resolves, and with no artifact to sacrifice nothing else does.
// - The find stays in the library while it's decided where it goes
//   (`destination: "stay"`): onto the battlefield, or — for a greater mana
//   value — a `may` paying {X} fixed at the difference (`xIs`), into its
//   owner's graveyard if not paid. The library is shuffled after.
// - The extra mana is paid as it resolves, not part of the spell's cost
//   (ruling).

const SACRIFICED_MV = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "sacrificed" } } as const;

export default defineCard({
  name: "Transmute Artifact",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Sacrifice an artifact. If you do, search your library for an artifact card. If that card's mana value is less than or equal to the sacrificed artifact's mana value, put it onto the battlefield. If it's greater, you may pay {X}, where X is the difference. If you do, put it onto the battlefield. If you don't, put it into its owner's graveyard. Then shuffle.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", who: "you" },
        then: {
          kind: "search-library",
          filter: { type: "artifact" },
          destination: "stay",
          min: 0,
          max: 1,
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: { amount: SACRIFICED_MV } } } },
            then: { kind: "put-onto-battlefield", target: 0 },
            else: {
              kind: "may",
              prompt: "Pay the difference to put it onto the battlefield?",
              cost: "{X}",
              xIs: { difference: [{ manaValueOf: 0 }, SACRIFICED_MV] },
              effect: { kind: "put-onto-battlefield", target: 0 },
              else: { kind: "put-into-graveyard", target: 0 },
            },
          },
        },
      },
    ],
  },
});
