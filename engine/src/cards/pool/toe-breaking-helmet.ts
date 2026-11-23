import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Playtest card (Mystery Booster 2).

const SACRIFICE =
  "{2}, {T}, Sacrifice Toe-Breaking Helmet: Put two -1/-1 counters on target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Toe-Breaking Helmet",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${SACRIFICE}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 },
      resolve: null,
      sorcerySpeed: true,
      text: SACRIFICE,
    },
    equip("{1}"),
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
});
