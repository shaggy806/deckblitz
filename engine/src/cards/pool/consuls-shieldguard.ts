import { defineCard } from "../define.js";

// EDHREC rank 26249. Smelted Chargebug's shape: the target is chosen as the
// attack trigger goes on the stack, the {E} paid as it resolves.

const ENTER = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK =
  "Whenever this creature attacks, you may pay {E}. If you do, another target attacking creature gains indestructible until end of turn.";

export default defineCard({
  name: "Consul's Shieldguard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 3,
  toughness: 4,
  text: `${ENTER}\n${ATTACK}`,
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
        prompt: "Pay {E} to give that creature indestructible until end of turn?",
        costEnergy: 1,
        effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
