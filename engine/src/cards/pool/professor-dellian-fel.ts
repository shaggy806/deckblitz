import { defineCard } from "../define.js";

// EDHREC rank 6849.
const PLUS_TEXT = "+2: You gain 3 life.";
const ZERO_TEXT = "0: You draw a card and lose 1 life.";
const MINUS_TEXT = "−3: Destroy target creature.";
const EMBLEM_TEXT = "Whenever you gain life, target opponent loses that much life.";
const ULTIMATE_TEXT = `−6: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Professor Dellian Fel",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dellian"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${ZERO_TEXT}\n${MINUS_TEXT}\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            // Sanguine Bond's ability: once per life-gain event.
            trigger: { on: "gains-life", who: "you" },
            targets: ["opponent"],
            effect: { kind: "lose-life", target: 0, amount: { triggerValue: true } },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
});
