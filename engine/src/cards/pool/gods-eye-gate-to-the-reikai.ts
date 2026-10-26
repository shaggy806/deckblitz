import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 13688.
const DIES_TEXT = "When Gods' Eye is put into a graveyard from the battlefield, create a 1/1 colorless Spirit creature token.";

export default defineCard({
  name: "Gods' Eye, Gate to the Reikai",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `{T}: Add {C}.\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
