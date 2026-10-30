import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Duskmourn: House of Horror (DSK). The sacrifice is chosen as the
// trigger resolves — "you may": choosing none is the answer — from your
// permanents other than the attacking creature (`exceptTriggerObject`) and
// this Equipment (`exceptSource`). Only a sacrifice that happened draws.

const PUMP = "Equipped creature gets +2/+0.";
const ATTACK =
  "Whenever equipped creature attacks, you may sacrifice a permanent other than that creature or this Equipment. If you do, draw a card.";

export default defineCard({
  name: "Saw",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${ATTACK}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: PUMP }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        exceptSource: true,
        exceptTriggerObject: true,
        upTo: 1,
        then: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-target", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "you" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
        prompt: "You may sacrifice a permanent other than the attacking creature or Saw to draw a card",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [equip("{2}")],
});
