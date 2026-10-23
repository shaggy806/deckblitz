import { defineCard } from "../define.js";

// EDHREC rank 28275.
const ENTER = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK =
  "Whenever this creature attacks, you may pay {E}. If you do, it gets +1/+1 and gains trample until end of turn.";

export default defineCard({
  name: "Voltaic Brawler",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
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
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E} to give this creature +1/+1 and trample until end of turn?",
        costEnergy: 1,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
