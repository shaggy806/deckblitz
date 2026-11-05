import { defineCard } from "../define.js";

// "Creature sources" reach a creature card's ability in any zone (rule
// 109.2a — `abilityOfAnyZone`, Secluded Courtyard's reading).

const MANA_TEXT = "{T}: Add two mana of any one color. Spend this mana only to activate abilities of creature sources.";

export default defineCard({
  name: "Shang-Chi, Master of Kung Fu",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 2,
  text: `You may activate abilities of creatures you control as though those creatures had haste.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 2,
        spendOnly: {
          abilityOf: { type: "creature" },
          abilityOfAnyZone: true,
          text: "Spend this mana only to activate abilities of creature sources.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      activateAsThoughHaste: { type: "creature" },
      text: "You may activate abilities of creatures you control as though those creatures had haste.",
    },
  ],
});
