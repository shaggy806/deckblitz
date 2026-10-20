import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 11722.
//
// The granted mana ability is Gift of Paradise's; the enters trigger is
// Roaring Earth's "target creature or Vehicle you control".
const ENTER_TEXT = "When this Aura enters, put a +1/+1 counter on target creature or Vehicle you control.";
const GRANT_TEXT = 'Enchanted land has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "Grafted Growth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${ENTER_TEXT}\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [addManaAbility({ mana: "any-color", amount: 2, text: "{T}: Add two mana of any one color." })],
      text: GRANT_TEXT,
    },
  ],
});
