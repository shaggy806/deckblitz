import { defineCard } from "../define.js";

// EDHREC rank 13677.

export default defineCard({
  name: "Denzilore Fatehold",
  manaCost: "{1}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Sphinx"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhenever you scry or surveil, put a +1/+1 counter on each creature you control.",
  triggered: [
    {
      trigger: { on: "scries", who: "you", orSurveil: true },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you scry or surveil, put a +1/+1 counter on each creature you control.",
    },
  ],
});
