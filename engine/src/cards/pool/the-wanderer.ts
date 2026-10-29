import { defineCard } from "../define.js";

// EDHREC rank 4935.
//
// Rulings:
//   If The Wanderer would be dealt lethal damage at the same time as you and/or other permanents
//   you control would be dealt noncombat damage, the damage that would be dealt to you and your
//   other permanents is prevented.
const STATIC_TEXT = "Prevent all noncombat damage that would be dealt to you and other permanents you control.";
const MINUS_TEXT = "−2: Exile target creature with power 4 or greater.";

export default defineCard({
  name: "The Wanderer",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  loyalty: 5,
  text: `${STATIC_TEXT}\n${MINUS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: false, prevent: true, to: "your-side", toOther: true },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
