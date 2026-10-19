import { defineCard } from "../define.js";

// EDHREC rank 28190.

export default defineCard({
  name: "Voice of the Vermin",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: "This creature enters with a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\nWhenever this creature attacks, target creature you control has base power and toughness 4/4 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "animate", target: 0, power: 4, toughness: 4, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target creature you control has base power and toughness 4/4 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "This creature enters with a shield counter on it.",
    },
  ],
});
