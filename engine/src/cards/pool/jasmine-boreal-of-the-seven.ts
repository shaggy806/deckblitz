import { defineCard } from "../define.js";

// "With no abilities" asks of the spell as it's cast (rule 601.2a): one a static
// gives cascade as it's cast (Abaddon the Despoiler) has an ability, a card that
// prints nothing but is granted nothing doesn't.
const MANA_TEXT = "{T}: Add {G}{W}. Spend this mana only to cast creature spells with no abilities.";
const BLOCK_TEXT = "Creatures you control with no abilities can't be blocked by creatures with abilities.";
const SPEND_TEXT = "Spend this mana only to cast creature spells with no abilities.";

export default defineCard({
  name: "Jasmine Boreal of the Seven",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 4,
  text: `${MANA_TEXT}\n${BLOCK_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["G", "W"] },
        amount: 1,
        spendOnly: { spell: { type: "creature", hasAbilities: false }, text: SPEND_TEXT },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", hasAbilities: false } },
      cantBeBlockedBy: { hasAbilities: true },
      text: BLOCK_TEXT,
    },
  ],
});
