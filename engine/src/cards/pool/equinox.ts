import { defineCard } from "../define.js";

const ABILITY_TEXT = "{T}: Counter target spell if it would destroy a land you control.";
const GRANT_TEXT = `Enchanted land has "${ABILITY_TEXT}"`;

// Any spell may be targeted (the ruling); whether it would destroy a land the
// ability's controller controls is judged as the ability resolves, from the
// spell's own instructions (`spell-would-destroy`).
export default defineCard({
  name: "Equinox",
  manaCost: "{W}",
  colors: ["W"],
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
          effect: {
            kind: "conditional",
            condition: { kind: "spell-would-destroy", spell: 0, filter: { type: "land", controlledBy: "you" } },
            then: { kind: "counter", target: 0 },
          },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
