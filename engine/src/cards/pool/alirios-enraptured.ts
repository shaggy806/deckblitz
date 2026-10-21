import { defineCard } from "../define.js";

// Only its own untap step: an effect can still untap it, and losing the
// Reflection untaps nothing until the next untap step (the rulings).
const UNTAP_TEXT = "Alirios doesn't untap during your untap step if you control a Reflection.";
const ENTER_TEXT = "When Alirios enters, create a 3/2 blue Reflection creature token.";

export default defineCard({
  name: "Alirios, Enraptured",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  text: `Alirios enters tapped.\n${UNTAP_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Reflection Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Alirios enters tapped.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Reflection" }, atLeast: 1 },
      doesntUntap: true,
      text: UNTAP_TEXT,
    },
  ],
});
