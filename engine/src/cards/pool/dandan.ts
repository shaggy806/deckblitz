import { defineCard } from "../define.js";


export default defineCard({
  name: "Dandân",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 4,
  toughness: 1,
  text: "This creature can't attack unless defending player controls an Island.\nWhen you control no Islands, sacrifice this creature.",
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
  ],
});
