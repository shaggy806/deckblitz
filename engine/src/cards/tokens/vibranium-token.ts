import { defineCard } from "../define.js";

// The predefined Vibranium token (Marvel Super Heroes Commander — Vibranium
// Mining Mech). Its mana is the Powerstone's deny-list (`notSpell`): it pays
// for anything but casting a nonartifact spell. Entering tapped isn't part of
// the token — the maker says `tapped`.

const MANA_TEXT = "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.";

export default defineCard({
  name: "Vibranium Token",
  art: "252ff4c7-758e-4ceb-aed1-ef15a94e245e",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vibranium"],
  keywords: ["indestructible"],
  text: `Indestructible\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: { notSpell: { notTypes: ["artifact"] }, text: "This mana can't be spent to cast a nonartifact spell." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
