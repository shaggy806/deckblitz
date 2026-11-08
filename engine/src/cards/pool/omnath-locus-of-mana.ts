import { defineCard } from "../define.js";

const KEEP_TEXT = "You don't lose unspent green mana as steps and phases end.";
const SIZE_TEXT = "Omnath gets +1/+1 for each unspent green mana you have.";

// EDHREC rank 3735. Leyline Tyrant's permission for green, and a size read off
// the pool (rule 106.4). Once Omnath leaves, the green mana empties as the
// current step or phase ends, as any other mana does (the ruling).
export default defineCard({
  name: "Omnath, Locus of Mana",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: `${KEEP_TEXT}\n${SIZE_TEXT}`,
  static: [
    { affects: { scope: "self" }, keepsUnspentMana: ["G"], text: KEEP_TEXT },
    { affects: { scope: "self" }, grantPtPerCount: { unspentMana: { type: "G" }, pt: [1, 1] }, text: SIZE_TEXT },
  ],
});
