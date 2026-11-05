import { defineCard } from "../define.js";

// EDHREC rank 3589. "Those creatures" are the attackers of the declaration,
// still on the battlefield, removed from combat or not (the ruling).
const ETB_TEXT = "When this enchantment enters, create X 1/1 colorless Hero creature tokens.";
const LIGHT_TEXT = "Light Party — Whenever you attack with four or more creatures, scry 2, then draw a card.";
const FULL_TEXT =
  "Full Party — Whenever you attack with eight or more creatures, those creatures get +4/+4 until end of turn.";

export default defineCard({
  name: "Champions from Beyond",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${LIGHT_TEXT}\n${FULL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: "x" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 4 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: LIGHT_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 8 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { triggerBatch: true },
        power: 4,
        toughness: 4,
        duration: "end-of-turn",
      },
      resolve: null,
      text: FULL_TEXT,
    },
  ],
});
