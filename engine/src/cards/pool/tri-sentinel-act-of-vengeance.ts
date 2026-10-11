import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 12424. Marvel Super Heroes Commander.
//
// "For each opponent, … up to one target creature that player controls":
// one optional slot per opponent seat (Hammers of Moradin's shape); a seat
// with no target chosen is a hole its damage skips. One instruction, so the
// damage is dealt at once (`simultaneous`).
const ENTER_TEXT =
  "When Tri-Sentinel enters, for each opponent, Tri-Sentinel deals 3 damage to up to one target creature that player controls.";
const UNEARTH_TEXT =
  "Unearth {7} ({7}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Tri-Sentinel, Act of Vengeance",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "menace", "trample"],
  text: `Flying, menace, trample\n${ENTER_TEXT}\n${UNEARTH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "damage", amount: 3, target: 1 },
          { kind: "damage", amount: 3, target: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [unearth("{7}")],
});
