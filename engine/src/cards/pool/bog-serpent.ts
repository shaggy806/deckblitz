import { defineCard } from "../define.js";


export default defineCard({
  name: "Bog Serpent",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  text: "This creature can't attack unless defending player controls a Swamp.\nWhen you control no Swamps, sacrifice this creature.",
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Swamps, sacrifice this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Swamp" } } }],
      text: "This creature can't attack unless defending player controls a Swamp.",
    },
  ],
});
