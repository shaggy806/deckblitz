import { defineCard } from "../define.js";

// Journey to Nowhere's linked exile and return, and a rhystic upkeep
// (`unless` with `chooser: "any-player"`): any player — its controller
// included — may pay the {3} to keep it.

const ENTER_TEXT = "When this enchantment enters, exile target creature.";
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless any player pays {3}.";
const LEAVE_TEXT =
  "When this enchantment leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Icy Prison",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "any-player",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
