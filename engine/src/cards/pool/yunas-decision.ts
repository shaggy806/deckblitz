import { defineCard } from "../define.js";

// A land put onto the battlefield this way isn't a land play (the ruling).

const PILGRIMAGE_TEXT =
  "• Continue the Pilgrimage — Sacrifice a creature. If you do, draw a card, then you may put a creature card and/or a land card from your hand onto the battlefield.";
const ANOTHER_WAY_TEXT = "• Find Another Way — Return one or two target permanent cards from your graveyard to your hand.";
const PERMANENT_CARD = { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } } as const;

export default defineCard({
  name: "Yuna's Decision",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n${PILGRIMAGE_TEXT}\n${ANOTHER_WAY_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: PILGRIMAGE_TEXT,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed" },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 1 },
                  {
                    kind: "look-and-choose",
                    zone: "hand",
                    min: 0,
                    max: 2,
                    together: {
                      oneEach: [
                        { label: "a creature card", filter: { type: "creature" } },
                        { label: "a land card", filter: { type: "land" } },
                      ],
                      text: "a creature card and/or a land card",
                    },
                    destination: "battlefield",
                    leftover: "stay",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        text: ANOTHER_WAY_TEXT,
        targets: [PERMANENT_CARD, { kind: "optional", of: { kind: "other", of: PERMANENT_CARD, than: { slot: 0 } } }],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
    ],
  },
});
