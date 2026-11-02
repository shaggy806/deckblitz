import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const MONARCH = "When a legendary creature you control enters, if there is no monarch, you become the monarch.";
const EQUIP = "Equip {4}. This ability costs {3} less to activate if you're the monarch.";
const STATIC = "Equipped creature gets +1/+1 for each creature you control.";

export default defineCard({
  name: "Crown of Gondor",
  manaCost: "{3}",
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC}\n${MONARCH}\n${EQUIP}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", supertype: "legendary" } },
      condition: { kind: "monarch", who: "nobody" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH,
    },
  ],
  activated: [
    {
      ...equip("{4}"),
      costReduction: { reduceGeneric: 3, condition: { kind: "monarch", who: "you" } },
      text: EQUIP,
    },
  ],
});
