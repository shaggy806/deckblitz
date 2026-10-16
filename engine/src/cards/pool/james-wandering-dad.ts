import { defineCard } from "../define.js";

// EDHREC rank 8703. Fallout. An Adventure card; its Adventure is Follow Him.
//
// Omen Hawker's restriction: the mana pays only for activating abilities, of
// any source in any zone, never for casting a spell.
const MANA_TEXT = "{T}: Add {C}{C}. Spend this mana only to activate abilities.";

export default defineCard({
  name: "James, Wandering Dad",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 4,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: { abilityOf: {}, abilityOfAnyZone: true, text: "Spend this mana only to activate abilities." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  faces: ["James, Wandering Dad", "Follow Him"],
  adventure: true,
});
