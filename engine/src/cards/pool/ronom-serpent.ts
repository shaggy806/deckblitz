import { defineCard } from "../define.js";

const ATTACK_TEXT = "This creature can't attack unless defending player controls a snow land.";
const SACRIFICE_TEXT = "When you control no snow lands, sacrifice this creature.";

export default defineCard({
  name: "Ronom Serpent",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 6,
  text: `${ATTACK_TEXT}\n${SACRIFICE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { type: "land", supertype: "snow" } },
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
