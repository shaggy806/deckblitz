import { defineCard } from "../define.js";

// EDHREC rank 1250. The Brothers' War.
//
// Rulings:
//   The third ability applies only to casting spells. It does not, for example, change when you
//     may activate abilities that can be activated "only as a sorcery."
//   The last ability cares only about the amount of mana that was actually spent to cast the
//     spell, regardless of its mana cost.

const FLASH_TEXT = "You may cast colorless spells and artifact spells as though they had flash.";
const COUNTER_TEXT =
  "Whenever you cast a spell, if the amount of mana spent to cast that spell is greater than Liberator's power, put a +1/+1 counter on Liberator.";

export default defineCard({
  name: "Liberator, Urza's Battlethopter",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Thopter"],
  power: 1,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${FLASH_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: { anyOf: [{ colorless: true }, { type: "artifact" }] },
      text: FLASH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: {
        kind: "amounts",
        left: { manaSpentOf: "trigger-object" },
        op: "gt",
        right: { powerOf: "source" },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
