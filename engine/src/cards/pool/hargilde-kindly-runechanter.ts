import { defineCard } from "../define.js";

// EDHREC rank 17187.
const MANA_TEXT = "{T}: Add {C}{C}. Spend this mana only to cast artifact spells or activate abilities of artifacts.";

export default defineCard({
  name: "Hargilde, Kindly Runechanter",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  pairing: { kind: "partner-group", group: "Friends forever" },
  text: `${MANA_TEXT}\nPartner—Friends forever (You can have two commanders if both have this ability.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          text: "Spend this mana only to cast artifact spells or activate abilities of artifacts.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
