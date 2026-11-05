import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "At the beginning of each opponent's upkeep, this enchantment deals X damage to that player, where X is the number of nontoken permanents of the chosen color they control.";
const UPKEEP_TEXT = "At the beginning of your upkeep, destroy this enchantment unless you sacrifice two Islands.";

export default defineCard({
  name: "Psychic Allergy",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  text: `As this enchantment enters, choose a color.\n${DAMAGE_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "damage",
        who: "active-player",
        amount: { countOf: { controlledBy: "active-player", token: false, ofChosenColor: true } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { subtype: "Island" }, count: 2, text: "Sacrifice two Islands" }],
        otherwise: { kind: "destroy", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
