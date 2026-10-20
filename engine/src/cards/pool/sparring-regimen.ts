import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 17658. Learn is the rummage alone (no sideboard — see
// AUTHORING.md's "learn" row). "Untap it" is the same attacking creature.
const ATTACK_TEXT = "Whenever you attack, put a +1/+1 counter on target attacking creature and untap it.";

export default defineCard({
  name: "Sparring Regimen",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `When this enchantment enters, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: learn(),
      resolve: null,
      text: "When this enchantment enters, learn.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
