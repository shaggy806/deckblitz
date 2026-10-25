import { defineCard } from "../define.js";

// EDHREC rank 21153. "Another creature on the battlefield" is anyone's: one
// you control other than Shauku, or one an opponent controls.

const ATTACK_TEXT = "Shauku can't attack if there's another creature on the battlefield.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you lose 3 life.";
const EXILE_TEXT = "{T}: Exile target creature and put a +1/+1 counter on Shauku.";

export default defineCard({
  name: "Shauku, Endbringer",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${UPKEEP_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeSelf: true },
          { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 },
        ],
      },
      restrictions: ["cant-attack"],
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 3 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
