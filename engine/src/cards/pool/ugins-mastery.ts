import { defineCard } from "../define.js";

const CAST_TEXT =
  "Whenever you cast a colorless creature spell, manifest the top card of your library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";
const ATTACK_TEXT =
  "Whenever you attack with creatures with total power 6 or greater, you may turn a face-down creature you control face up.";

export default defineCard({
  name: "Ugin's Mastery",
  manaCost: "{4}",
  colors: [],
  types: ["enchantment"],
  text: `${CAST_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", colorless: true } },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", totalPower: { atLeast: 6 } },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", faceDown: true },
        upTo: 1,
        then: { kind: "turn-face-up", target: 0 },
        prompt: "You may turn a face-down creature you control face up",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
