import { defineCard } from "../define.js";
import type { ActivatedAbility } from "../../abilities.js";

// Onslaught. EDHREC rank 25721. Lightning Volley's mass grant, over Wizards
// you control, of Ertai, Wizard Adept's counter (without its mana).

const GRANTED_TEXT = "{T}: Counter target spell.";
const COUNTER: ActivatedAbility = {
  cost: { mana: null, tap: true },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
  resolve: null,
  text: GRANTED_TEXT,
};

export default defineCard({
  name: "Psychic Trance",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Until end of turn, Wizards you control gain "${GRANTED_TEXT}"`,
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "creature", subtype: "Wizard", controlledBy: "you" },
    ability: COUNTER,
    duration: "end-of-turn",
  },
});
