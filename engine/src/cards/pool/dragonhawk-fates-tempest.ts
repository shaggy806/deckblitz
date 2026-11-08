import { defineCard } from "../define.js";

// Bloomburrow. "Enters or attacks" is two triggers (Aetherwind Basker's
// shape). X is counted as the ability resolves (its ruling). The end-step
// ability is a delayed trigger about the cards this resolution exiled, so it
// counts only those (its ruling), and only the ones still the objects they
// were — a card played from exile is a new object (rule 400.7).
const TRIGGER_TEXT =
  "Whenever Dragonhawk enters or attacks, exile the top X cards of your library, where X is the number of creatures you control with power 4 or greater. You may play those cards until your next end step. At the beginning of your next end step, Dragonhawk deals 2 damage to each opponent for each of those cards that are still exiled.";

const EFFECT = {
  kind: "sequence",
  effects: [
    {
      kind: "impulse-exile",
      amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } } },
      duration: "until-your-next-end-step",
      play: true,
    },
    {
      kind: "delayed-trigger",
      at: "your-next-end-step",
      about: "exiled",
      effect: { kind: "damage", amount: { product: [2, { objectTargets: true }] }, who: "each-opponent" },
      text: "Dragonhawk deals 2 damage to each opponent for each of those cards that are still exiled.",
    },
  ],
} as const;

export default defineCard({
  name: "Dragonhawk, Fate's Tempest",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Bird", "Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
