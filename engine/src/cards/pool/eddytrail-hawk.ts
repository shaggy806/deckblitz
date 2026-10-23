import { defineCard } from "../define.js";

// EDHREC rank 20395. "If you do": the target is chosen as the attack trigger
// goes on the stack and the {E} is paid as it resolves (Smelted Chargebug's
// shape) — with the target gone, nothing can be paid (the ruling).
const ENTER = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK =
  "Whenever this creature attacks, you may pay {E}. If you do, another target attacking creature gains flying until end of turn.";

export default defineCard({
  name: "Eddytrail Hawk",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "may",
        prompt: "Pay {E} to give that creature flying until end of turn?",
        costEnergy: 1,
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
