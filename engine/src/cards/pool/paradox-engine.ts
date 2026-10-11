import { defineCard } from "../define.js";

// Rulings:
//   Paradox Engine's triggered ability resolves before the spell that caused it to trigger. The
//     ability will resolve even if that spell is countered.
export default defineCard({
  name: "Paradox Engine",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "Whenever you cast a spell, untap all nonland permanents you control.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "untap-all", filter: { notTypes: ["land"], controlledBy: "you" } },
      resolve: null,
      text: "Whenever you cast a spell, untap all nonland permanents you control.",
    },
  ],
});
