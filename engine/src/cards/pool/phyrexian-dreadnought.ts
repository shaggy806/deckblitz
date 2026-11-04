import { defineCard } from "../define.js";

// Which is chosen as it resolves (the ruling), itself among what may be sacrificed;
// unable to reach 12, it's sacrificed (the ruling). Gone by then, the choice is
// still offered (the ruling), and no longer sacrifices it.
const TEXT = "When this creature enters, sacrifice it unless you sacrifice any number of creatures with total power 12 or greater.";

export default defineCard({
  name: "Phyrexian Dreadnought",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Dreadnought"],
  power: 12,
  toughness: 12,
  keywords: ["trample"],
  text: "Trample\n" + TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            sacrifice: { type: "creature", controlledBy: "you" },
            totalPowerAtLeast: 12,
            text: "Sacrifice any number of creatures with total power 12 or greater",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
