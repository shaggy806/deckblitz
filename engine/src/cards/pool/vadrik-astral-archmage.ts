import { defineCard } from "../define.js";

// EDHREC rank 11776.

export default defineCard({
  name: "Vadrik, Astral Archmage",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  becomesDayAsEnters: true,
  text: "If it's neither day nor night, it becomes day as Vadrik enters.\nInstant and sorcery spells you cast cost {X} less to cast, where X is Vadrik's power.\nWhenever day becomes night or night becomes day, put a +1/+1 counter on Vadrik.",
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever day becomes night or night becomes day, put a +1/+1 counter on Vadrik.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"] },
        caster: "you",
        reduceGeneric: { powerOf: "source" },
      },
      text: "Instant and sorcery spells you cast cost {X} less to cast, where X is Vadrik's power.",
    },
  ],
});
