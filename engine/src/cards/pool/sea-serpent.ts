import { defineCard } from "../define.js";

// "Defending player" is the player it would attack (rule 506.2): at a table
// of four it may attack an opponent with an Island and not one without.
const ATTACK = "This creature can't attack unless defending player controls an Island.";
const SAC = "When you control no Islands, sacrifice this creature.";

export default defineCard({
  name: "Sea Serpent",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  text: `${ATTACK}\n${SAC}`,
  static: [{ affects: { scope: "self" }, cantAttackUnlessDefender: { controls: { subtype: "Island" } }, text: ATTACK }],
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC,
    },
  ],
});
