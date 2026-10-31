import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Makes Rebel → use "Rebel Token".
// "Of other Equipment": its own equip ability pays full price.

const REDUCE_TEXT = "Equip abilities you activate of other Equipment cost {1} less to activate.";
const DOUBLE_TEXT = "Equipped creature has double strike.";

export default defineCard({
  name: "Bladehold War-Whip",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)\n${REDUCE_TEXT}\n${DOUBLE_TEXT}\nEquip {3}{R}{W}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { subtype: "Equipment", isSource: false },
        abilityKind: "equip",
        byYou: true,
        reduceGeneric: 1,
      },
      text: REDUCE_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantKeywords: ["double-strike"],
      text: DOUBLE_TEXT,
    },
  ],
  activated: [equip("{3}{R}{W}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Rebel Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "For Mirrodin!",
    },
  ],
});
