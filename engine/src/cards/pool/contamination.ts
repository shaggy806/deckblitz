import { defineCard } from "../define.js";

// Urza's Saga.
//
// Rulings:
//   [2004-10-04] The second ability of this card is a replacement effect, not a triggered ability.
//   [2004-10-04] You choose whether to sacrifice a creature or not on resolution. If not, then you
//     sacrifice Contamination. You can choose to not sacrifice even if you no longer control
//     Contamination on resolution.
//   [2004-10-04] External effects that generate more mana still generate their additional mana as
//     directed without being affected by this card. Effects which generate more mana based on what
//     type of mana the land produces will be affected in color but not in amount.
//
// `manaProduction`'s `one`: a land that makes mana makes one {B}, whatever it would have made; one
// that makes none still makes none. What triggered mana abilities add isn't the land's.

const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you sacrifice a creature.";
const LANDS = "If a land is tapped for mana, it produces {B} instead of any other type and amount.";

export default defineCard({
  name: "Contamination",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${LANDS}`,
  static: [
    {
      affects: { scope: "self" },
      manaProduction: [{ filter: { type: "land" }, produces: "B", tapper: "any", one: true }],
      text: LANDS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
