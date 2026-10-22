import { defineCard } from "../define.js";

// EDHREC rank 17188. Ixalan. The Vampires are counted as the ability
// resolves, the Bishop itself among them if it's still there (the ruling).

export default defineCard({
  name: "Bishop of the Bloodstained",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, target opponent loses 1 life for each Vampire you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: { countOf: { subtype: "Vampire", controlledBy: "you" } }, target: 0 },
      resolve: null,
      text: "When this creature enters, target opponent loses 1 life for each Vampire you control.",
    },
  ],
});
