import { defineCard } from "../define.js";

// EDHREC rank 6037.

export default defineCard({
  name: "Anafenza, Kin-Tree Spirit",
  manaCost: "{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Whenever another nontoken creature you control enters, bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "bolster", amount: 1 },
      resolve: null,
      text: "Whenever another nontoken creature you control enters, bolster 1.",
    },
  ],
});
