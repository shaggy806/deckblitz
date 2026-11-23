import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Umezawa's Jitte's counters and Sensei's
// Divining Top's two abilities as Jitte modes. "Tap it. If you do" draws only
// when this resolution tapped it: already tapped, nothing more happens (rule
// 701.26a, an "if you do" on an act that didn't happen).
const MODES_TEXT =
  "Remove a charge counter from Jitte and Divining Top: Choose one —\n• You gain 2 life.\n• Look at the top 3 cards of your library, then put them back in any order.\n• Tap Jitte and Divining Top. If you do, draw a card, then put Jitte and Divining Top on top of its owner's library.";
const TRIGGER_TEXT = "Whenever equipped creature deals combat damage, put 2 charge counters on Jitte and Divining Top.";

export default defineCard({
  name: "Jitte and Divining Top",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TRIGGER_TEXT}\n${MODES_TEXT}\nEquip {1}`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "You gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
          {
            text: "Look at the top 3 cards of your library, then put them back in any order.",
            effect: {
              kind: "look-and-choose",
              zone: "library",
              count: 3,
              min: 3,
              max: 3,
              destination: "library-top",
              leftover: "stay",
            },
          },
          {
            text: "Tap Jitte and Divining Top. If you do, draw a card, then put Jitte and Divining Top on top of its owner's library.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "tapped" },
                  then: {
                    kind: "sequence",
                    effects: [
                      { kind: "draw", amount: 1 },
                      { kind: "put-on-library", target: "source", position: "top" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: MODES_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 2 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
