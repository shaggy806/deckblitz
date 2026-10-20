import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). Domain as Nishoba Brawler's CDA, both halves.
const DOMAIN_TEXT =
  "Domain — Territorial Kavu's power and toughness are each equal to the number of basic land types among lands you control.";
const ATTACK_TEXT =
  "Whenever this creature attacks, choose one —\n• Discard a card. If you do, draw a card.\n• Exile up to one target card from a graveyard.";

export default defineCard({
  name: "Territorial Kavu",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 0,
  toughness: 0,
  text: `${DOMAIN_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { basicLandTypes: "you" }, plusPower: 0, plusToughness: 0 },
      text: DOMAIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Discard a card. If you do, draw a card.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 1 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "discarded" },
                  then: { kind: "draw", amount: 1 },
                },
              ],
            },
          },
          {
            text: "Exile up to one target card from a graveyard.",
            targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
            effect: { kind: "exile", target: 0 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
