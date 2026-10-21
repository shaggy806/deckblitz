import { defineCard } from "../define.js";

// EDHREC rank 26783. Rivals of Ixalan.

export default defineCard({
  name: "Sanguine Glorifier",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, put a +1/+1 counter on another target Vampire you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Vampire" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on another target Vampire you control.",
    },
  ],
});
