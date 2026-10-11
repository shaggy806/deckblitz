import { defineCard } from "../define.js";

// EDHREC rank 14593. Marvel Super Heroes Commander.
//
// "Kingpin or another creature" is any creature you sacrifice, Kingpin
// itself included (a leaves-the-battlefield trigger, rule 603.10a).

const TEXT =
  "Whenever you sacrifice Kingpin or another creature, create two Treasure tokens. This ability triggers only once each turn. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")";

export default defineCard({
  name: "Kingpin, Wilson Fisk",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
