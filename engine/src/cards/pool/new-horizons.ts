import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 7121.
//
// Rulings:
//   [2019-05-03] If the land this Aura would enchant is an illegal target by the time New
//     Horizons resolves, the entire spell doesn't resolve. It won't enter the battlefield, so its
//     ability won't trigger.
//   [2019-05-03] You can cast New Horizons even if you control no creatures.
//
// Gift of Paradise's shape: "two mana of any one color" is `any-color` with
// `amount: 2` — one colour, never a mix.
const COUNTER_TEXT = "When this Aura enters, put a +1/+1 counter on target creature you control.";
const GRANT_TEXT = 'Enchanted land has "{T}: Add two mana of any one color."';

export default defineCard({
  name: "New Horizons",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${COUNTER_TEXT}\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
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
