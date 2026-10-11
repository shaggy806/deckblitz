import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this Equipment enters, you may pay {2}. When you do, for each opponent, destroy up to one target creature or planeswalker that player controls.";

// "For each opponent … that player controls": one optional slot per
// opponent, bound to that player by seat (Dismantling Wave's shape), chosen
// as the reflexive ability goes on the stack — The Balrog of Moria's.
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { typesAnyOf: ["creature", "planeswalker"] } },
});

export default defineCard({
  name: "Lich's Relic",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\nEquipped creature gets +2/+1.\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to destroy up to one creature or planeswalker each opponent controls?",
        cost: "{2}",
        effect: {
          kind: "reflexive-trigger",
          targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
          effect: {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "destroy", target: 0 },
              { kind: "destroy", target: 1 },
              { kind: "destroy", target: 2 },
            ],
          },
          text: "When you do, for each opponent, destroy up to one target creature or planeswalker that player controls.",
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
});
