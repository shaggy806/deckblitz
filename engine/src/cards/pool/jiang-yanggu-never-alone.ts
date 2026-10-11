import { defineCard } from "../define.js";

// EDHREC rank 19862. Reality Fracture.
//
// Mowu is a named legendary token (Karox Bladewing's shape), so a second one
// is subject to the legend rule.

const ENTER_TEXT = "When Jiang Yanggu enters, create Mowu, a legendary 3/3 green Dog creature token.";
const UNTAP_TEXT = "At the beginning of your end step, untap all tokens you control.";

export default defineCard({
  name: "Jiang Yanggu, Never Alone",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mowu", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "untap-all", filter: { token: true, controlledBy: "you" } },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
