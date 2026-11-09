import { defineCard } from "../define.js";

// "They" is the owner of the entering permanent, whoever controlled it before.
const END_TEXT =
  "At the beginning of your end step, exile the top card of each opponent's library. You may play those cards for as long as they remain exiled. If you cast a spell this way, you may spend mana as though it were mana of any color to cast it.";
const STEAL_TEXT =
  "Whenever a nonland permanent an opponent owns enters the battlefield under your control, they lose life equal to its mana value.";

export default defineCard({
  name: "Brainstealer Dragon",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon", "Horror"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}\n${STEAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-opponent",
        duration: "while-exiled",
        spendAs: "any-color",
        play: true,
      },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { notTypes: ["land"], ownedBy: "opponent" },
      },
      targets: [],
      effect: { kind: "lose-life", amount: { manaValueOf: "trigger-object" }, who: { ownerOf: "trigger-object" } },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
