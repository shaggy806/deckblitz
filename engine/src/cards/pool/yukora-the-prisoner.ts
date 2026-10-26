import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 17550.
const TEXT = "When Yukora leaves the battlefield, sacrifice all non-Ogre creatures you control.";

export default defineCard({
  name: "Yukora, the Prisoner",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-all", who: "you", filter: { type: "creature", notSubtypes: ["Ogre"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
