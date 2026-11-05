import { defineCard } from "../define.js";

// EDHREC rank 19961. "equip-ability" is an equip ability alone, not every
// ability of an Equipment.
const MANA_TEXT =
  "Pay 2 life: Add two mana of any one color. Spend this mana only to cast Equipment spells or activate equip abilities. Activate only once each turn.";
const SAC_TEXT =
  "{T}, Sacrifice an Equipment attached to Ronin: Target creature gets -4/-4 until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Ronin, Shadow Stalker",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Hero"],
  power: 3,
  toughness: 3,
  text: `${MANA_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 2,
        spendOnly: {
          spell: { subtype: "Equipment" },
          purposes: ["equip-ability"],
          text: "Spend this mana only to cast Equipment spells or activate equip abilities.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
      oncePerTurn: true,
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Equipment", attachedTo: { isSource: true } } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
