import { defineCard } from "../define.js";

// EDHREC rank 14240.
//
// The look is Sarinth Steelseeker's: a Mount card may be revealed and taken
// (min 0); a card not taken may then go to the bottom (`secondPick`, asked
// only of what the first pick left), or stay on top.
const MOUNT_MANA = "{T}: Add one mana of any color. Spend this mana only to cast a Mount spell.";
const LOOK =
  "{3}, {T}: Look at the top card of your library. If it's a Mount card, you may reveal it and put it into your hand. If you don't put it into your hand, you may put it on the bottom of your library.";

export default defineCard({
  name: "Bucolic Ranch",
  colors: [],
  types: ["land"],
  subtypes: ["Desert"],
  text: `{T}: Add {C}.\n${MOUNT_MANA}\n${LOOK}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spendOnly: { spell: { subtype: "Mount" }, text: "Spend this mana only to cast a Mount spell." },
      },
      resolve: null,
      text: MOUNT_MANA,
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { subtype: "Mount" },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "library-bottom" },
        leftover: "stay",
      },
      resolve: null,
      text: LOOK,
    },
  ],
});
