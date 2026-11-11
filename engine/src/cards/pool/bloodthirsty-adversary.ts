import { defineCard } from "../define.js";

const PAID_TEXT =
  "When you pay this cost one or more times, put that many +1/+1 counters on this creature, then exile up to that many target instant and/or sorcery cards with mana value 3 or less from your graveyard and copy them. You may cast any number of the copies without paying their mana costs.";
const ETB_TEXT = `When this creature enters, you may pay {2}{R} any number of times. ${PAID_TEXT}`;

export default defineCard({
  name: "Bloodthirsty Adversary",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} any number of times for that many counters and exiled, copied spells?",
        cost: "{2}{R}",
        costTimes: true,
        effect: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "any-number",
              of: {
                kind: "card-in-graveyard",
                whose: "you",
                filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
              },
              max: "x",
            },
          ],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
              { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } },
              { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
            ],
          },
          text: PAID_TEXT,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
