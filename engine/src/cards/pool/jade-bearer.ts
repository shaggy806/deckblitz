import { defineCard } from "../define.js";

// EDHREC rank 22787. Rivals of Ixalan.

export default defineCard({
  name: "Jade Bearer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, put a +1/+1 counter on another target Merfolk you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on another target Merfolk you control.",
    },
  ],
});
