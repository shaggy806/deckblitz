import { defineCard } from "../define.js";

// EDHREC rank 13018.

const INCUBATE_TEXT = "When this Aura enters, incubate 2.";
const MANA_TEXT = "Whenever enchanted land is tapped for mana, its controller adds an additional one mana of any color.";

export default defineCard({
  name: "Blighted Burgeoning",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${INCUBATE_TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${MANA_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: INCUBATE_TEXT,
    },
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
