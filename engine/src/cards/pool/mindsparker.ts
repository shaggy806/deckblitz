import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever an opponent casts a white or blue instant or sorcery spell, this creature deals 2 damage to that player.";

export default defineCard({
  name: "Mindsparker",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike (This creature deals combat damage before creatures without first strike.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }], typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
