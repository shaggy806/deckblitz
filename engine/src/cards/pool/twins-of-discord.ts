import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever you attack, choose odd or even. Creatures with mana value of that quality can't block this turn. (Zero is even.)";
const BLOODTHIRST_TEXT =
  "Each other colorless creature you control has bloodthirst 2. (If an opponent was dealt damage this turn, that creature enters with two additional +1/+1 counters on it.)";

export default defineCard({
  name: "Twins of Discord",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 8,
  toughness: 6,
  text: `${ATTACK_TEXT}\n${BLOODTHIRST_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        options: ["odd", "even"],
        prompt: "Choose odd or even",
        then: {
          kind: "restrict",
          filter: { type: "creature", manaValueParity: "$chosen" },
          restrictions: ["cant-block"],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      // Bloodthirst 2 (rule 702.54a) on each of them: a replacement on its own
      // entering, so it adds to any bloodthirst the creature has itself.
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", colorless: true, controlledBy: "you" },
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
            then: 2,
            else: 0,
          },
        },
      },
      text: BLOODTHIRST_TEXT,
    },
  ],
});
