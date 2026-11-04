import { defineCard } from "../define.js";

export default defineCard({
  name: "Genestealer Locus",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Tyranid", "Human"],
  power: 3,
  toughness: 3,
  text: "Neurotraumal Rod — Whenever a creature attacks you, it gets -1/-0 until end of turn.\nWhenever a creature attacks one of your opponents, it gets +0/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true, defender: "player", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Neurotraumal Rod — Whenever a creature attacks you, it gets -1/-0 until end of turn.",
    },
    {
      trigger: { on: "attacks", who: "any", filter: { type: "creature", attackingOpponent: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature attacks one of your opponents, it gets +0/+1 until end of turn.",
    },
  ],
});
