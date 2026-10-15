import { defineCard } from "../define.js";

// EDHREC rank 16490.
// Makes Mutant → use "Mutant Token".

export default defineCard({
  name: "Mighty Mutanimals",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mutant", "Rebel"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, create a 2/2 red Mutant creature token.\nAlliance — Whenever another creature you control enters, put a +1/+1 counter on target creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutant Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/2 red Mutant creature token.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Alliance — Whenever another creature you control enters, put a +1/+1 counter on target creature you control.",
    },
  ],
});
