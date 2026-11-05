import { defineCard } from "../define.js";

// EDHREC rank 27018.

export default defineCard({
  name: "Gorilla Pack",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 3,
  toughness: 3,
  text: "This creature can't attack unless defending player controls a Forest.\nWhen you control no Forests, sacrifice this creature.",
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Forests, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Forest" } },
      text: "This creature can't attack unless defending player controls a Forest.",
    },
  ],
});
