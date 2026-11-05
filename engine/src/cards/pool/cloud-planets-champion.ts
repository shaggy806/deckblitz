import { defineCard } from "../define.js";

// EDHREC rank 7017.

const EQUIPPED_TEXT =
  "During your turn, as long as Cloud is equipped, it has double strike and indestructible. (This creature deals both first-strike and regular combat damage. Damage and effects that say \"destroy\" don't destroy this creature.)";
const COST_TEXT = "Equip abilities you activate that target Cloud cost {2} less to activate.";

export default defineCard({
  name: "Cloud, Planet's Champion",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Mercenary"],
  power: 4,
  toughness: 4,
  text: `${EQUIPPED_TEXT}\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "source", filter: { equipped: true } }] },
      grantKeywords: ["double-strike", "indestructible"],
      text: EQUIPPED_TEXT,
    },
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: {},
        abilityKind: "equip",
        byYou: true,
        targetingSource: true,
        reduceGeneric: 2,
      },
      text: COST_TEXT,
    },
  ],
});
