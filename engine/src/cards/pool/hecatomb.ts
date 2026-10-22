import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 24414.
//
// Rulings:
//   [2004-10-04] If you have less than 4 creatures, you do not partially sacrifice. You pay 4
//     creatures or none.
//   [2004-10-04] The sacrifice is done as a triggered ability just after it enters. It is not done
//     on casting.
//   [2004-10-04] You choose whether to sacrifice creatures or not on resolution. If not, then you
//     sacrifice Hecatomb. You can choose to not sacrifice creatures if you no longer control this
//     card on resolution.
//
// Mold Demon's `unless`: the four-creature option is offered only with four to
// sacrifice (rule 118.3), so there's no partial payment.

const ENTER_TEXT = "When this enchantment enters, sacrifice this enchantment unless you sacrifice four creatures.";
const TAP_TEXT = "Tap an untapped Swamp you control: This enchantment deals 1 damage to any target.";

export default defineCard({
  name: "Hecatomb",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${TAP_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Swamp", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature" }, count: 4, text: "Sacrifice four creatures" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
