import { defineCard } from "../define.js";

// EDHREC rank 11636. Marvel Super Heroes Commander.
//
// X is the colours of the spell that was cast (Ramos, Dragon Engine's
// `colorsOf: "trigger-object"`), read as the trigger resolves; a colourless
// spell deals 0.
const CAST_TEXT =
  "Whenever you cast a noncreature spell, Crystal deals X damage to each opponent, where X is the number of colors that spell is.";
const MANA_TEXT = "{T}: Add {R}, {G}, {W}, or {U}.";

export default defineCard({
  name: "Crystal, Inhuman Princess",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Inhuman", "Noble", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "damage", amount: { colorsOf: "trigger-object" }, who: "each-opponent" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G", "W", "U"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
