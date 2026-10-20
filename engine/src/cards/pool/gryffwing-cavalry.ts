import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// EDHREC rank 25086.
//
// The target is chosen as the attack trigger goes on the stack, and {1}{W}
// is paid (or not) as it resolves — no legal target, no chance to pay (the
// ruling).

const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {1}{W}. If you do, target attacking creature without flying gains flying until end of turn.";

export default defineCard({
  name: "Gryffwing Cavalry",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nTraining (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\n${ATTACK_TEXT}`,
  triggered: [
    training(),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to give the target creature flying until end of turn?",
        cost: "{1}{W}",
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
