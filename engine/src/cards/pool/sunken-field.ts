import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 19612.
//
// Rulings:
//   [2004-10-04] The spell's controller gets the option to pay when the ability resolves.
//
// The granted ability is Disruptive Student's: the spell's controller (`chooser: 0`) is asked
// as it resolves.

const GRANT_TEXT = 'Enchanted land has "{T}: Counter target spell unless its controller pays {1}."';

export default defineCard({
  name: "Sunken Field",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["spell"],
          effect: { kind: "unless", chooser: 0, options: [{ pay: "{1}", text: "Pay {1}" }], otherwise: { kind: "counter", target: 0 } },
          resolve: null,
          text: "{T}: Counter target spell unless its controller pays {1}.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
