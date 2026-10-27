import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever a permanent other than this enchantment is put into a graveyard from the battlefield, this enchantment deals 1 damage to each creature and each player.";
const SACRIFICE_TEXT = "When no creatures are on the battlefield, sacrifice this enchantment.";

export default defineCard({
  name: "Last Laugh",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DAMAGE_TEXT}\n${SACRIFICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", otherOnly: true, to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      // A state trigger (rule 603.8): no creature under anyone's control.
      trigger: {
        on: "state",
        state: {
          kind: "all",
          of: [
            { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
            { kind: "not", of: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 } },
          ],
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
