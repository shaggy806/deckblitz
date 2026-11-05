import { defineCard } from "../define.js";

const TURN_DOWN_TEXT = "{1}{G}: Turn this enchantment face down. (It becomes a 2/2 creature.)";

// Face down it's a 2/2 creature with no morph cost, so nothing turns it back
// up (the ruling).
export default defineCard({
  name: "Obscuring Aether",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Face-down creature spells you cast cost {1} less to cast.\n${TURN_DOWN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature", faceDown: true }, caster: "you", reduceGeneric: 1 },
      text: "Face-down creature spells you cast cost {1} less to cast.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "turn-face-down", target: "source" },
      resolve: null,
      text: TURN_DOWN_TEXT,
    },
  ],
});
