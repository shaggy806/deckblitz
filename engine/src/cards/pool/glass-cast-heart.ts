import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever one or more Vampires you control attack, create a Blood token.";
const VAMPIRE_TEXT = "{B}, {T}, Pay 1 life: Create a 1/1 white and black Vampire creature token with lifelink.";
const DRAIN_TEXT = "{B}{B}, {T}, Sacrifice this artifact and thirteen Blood tokens: Each opponent loses 13 life and you gain 13 life.";

// "This artifact and thirteen Blood tokens": a cost of two parts with a number
// each, all sacrificed at once.
export default defineCard({
  name: "Glass-Cast Heart",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ATTACK_TEXT}\n${VAMPIRE_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Vampire", controlledBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: true, payLife: 1 },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Vampire Token (Edgar, Charmed Groom // Edgar Markov's Coffin)",
        count: 1,
      },
      resolve: null,
      text: VAMPIRE_TEXT,
    },
    {
      cost: {
        mana: "{B}{B}",
        tap: true,
        sacrifice: {
          parts: [
            { filter: { isSource: true }, count: 1 },
            { filter: { subtype: "Blood", token: true }, count: 13 },
          ],
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "each-opponent", amount: 13 },
          { kind: "gain-life", amount: 13 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
