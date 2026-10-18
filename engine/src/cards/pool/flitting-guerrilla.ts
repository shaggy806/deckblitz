import { defineCard } from "../define.js";

// EDHREC rank 20298. March of the Machine.
//
// Paramecia Coloniex's shape, after the mill: the dies trigger has no
// target; exiling the card sets off a reflexive trigger, whose target is
// chosen then — a card just milled included (the ruling).

const DIES_TEXT =
  "When this creature dies, each player mills two cards. Then you may exile this card. When you do, put target creature or battle card from your graveyard on top of your library.";

export default defineCard({
  name: "Flitting Guerrilla",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT} (To mill two cards, a player puts the top two cards of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 2 },
          {
            kind: "may",
            prompt: "Exile Flitting Guerrilla?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: "trigger-object" },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "exiled" },
                  then: {
                    kind: "reflexive-trigger",
                    targets: [
                      { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "battle"] } },
                    ],
                    effect: { kind: "put-on-library", target: 0, position: "top" },
                    text: "When you do, put target creature or battle card from your graveyard on top of your library.",
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
