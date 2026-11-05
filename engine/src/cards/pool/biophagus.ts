import { defineCard } from "../define.js";

// EDHREC rank 3014.

export default defineCard({
  name: "Biophagus",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Tyranid", "Wizard"],
  power: 1,
  toughness: 3,
  text: "Genomic Enhancement — {T}: Add one mana of any color. If this mana is spent to cast a creature spell, that creature enters with an additional +1/+1 counter on it.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spellEntersWith: { spell: { type: "creature" }, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Genomic Enhancement — {T}: Add one mana of any color. If this mana is spent to cast a creature spell, that creature enters with an additional +1/+1 counter on it.",
    },
  ],
});
