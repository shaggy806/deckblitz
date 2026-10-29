import { defineCard } from "../define.js";

const permanentCard = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { notTypes: ["instant", "sorcery"] },
} as const;

export default defineCard({
  name: "Rite of Renewal",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to two target permanent cards from your graveyard to your hand. Target player shuffles up to four target cards from their graveyard into their library. Exile Rite of Renewal.",
  targets: [
    { kind: "optional", of: permanentCard },
    { kind: "optional", of: { kind: "other", of: permanentCard, than: { slots: [0] } } },
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 4, sameController: { slot: 2 } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      // The player gone illegal does nothing; with only the cards gone,
      // they still shuffle (Witness the Future's shape).
      {
        kind: "conditional",
        condition: { kind: "target-legal", index: 2 },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 3,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 3, position: "top" },
            },
            { kind: "shuffle-library", target: 2 },
          ],
        },
      },
    ],
  },
  exileOnResolve: true,
});
