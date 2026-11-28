import { CHOSEN_COLOR } from "../../effects.js";
import type { Color } from "../../mana.js";
import type { StaticAbility } from "../define.js";
import { defineCard } from "../define.js";

// "The last chosen color" is the one kept on the Aura (`chosenOnEnter`): the
// colour chosen as it entered, then each one its ability chose as it resolved
// (`choose-value` of a colour noted with `note { word }`, replacing the one
// before). The ability's X is defined by its text (rule 107.3c, `xIs`): the
// sleight counters on it as it's activated, before this activation's own goes
// on.

const PREVENT_TEXT = "Prevent all damage that would be dealt to enchanted creature by sources of the last chosen color.";
const ABILITY_TEXT = "{X}: Put a sleight counter on this Aura and choose a color. X is the number of sleight counters on this Aura.";
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];

export default defineCard({
  name: "Chromatic Armor",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nAs this Aura enters, choose a color.\nThis Aura enters with a sleight counter on it.\n${PREVENT_TEXT}\n${ABILITY_TEXT}`,
  targets: ["creature"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "sleight", amount: 1 } },
      text: "This Aura enters with a sleight counter on it.",
    },
    ...COLORS.map(
      (color): StaticAbility => ({
        affects: { scope: "self" },
        condition: { kind: "chosen-on-enter", value: color },
        replacement: { event: "would-deal-damage", to: "attached", source: { colors: [color] }, instead: { prevent: true } },
        text: PREVENT_TEXT,
      }),
    ),
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      xIs: { amount: { countersOn: "source", counter: "sleight" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "sleight", amount: 1 },
          { kind: "choose-value", value: "color", then: { kind: "note", word: CHOSEN_COLOR } },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
