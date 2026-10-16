import { defineCard } from "../define.js";

// EDHREC rank 18808.
//
// "If you do" (not "when you do"): the target is chosen as the attack
// trigger goes on the stack, and the {E} is a `may`'s `costEnergy` paid as
// it resolves — with the target gone illegal, it doesn't resolve and
// nothing can be paid (the ruling).
const ENERGY_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {E}. If you do, another target attacking creature gets +1/+0 and gains menace until end of turn.";

export default defineCard({
  name: "Smelted Chargebug",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${ENERGY_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENERGY_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "may",
        prompt: "Pay {E} to give that creature +1/+0 and menace until end of turn?",
        costEnergy: 1,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
