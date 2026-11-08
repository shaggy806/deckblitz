import { defineCard } from "../define.js";

// EDHREC rank 25007.

export default defineCard({
  name: "Manta Ray",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 3,
  toughness: 3,
  text: "This creature can't attack unless defending player controls an Island.\nThis creature can't be blocked except by blue creatures.\nWhen you control no Islands, sacrifice this creature.",
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Islands, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }],
      text: "This creature can't attack unless defending player controls an Island.",
    },
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { notColors: ["U"] } }],
      text: "This creature can't be blocked except by blue creatures.",
    },
  ],
});
