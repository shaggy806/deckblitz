import { defineCard } from "../define.js";

const STATIC_TEXT = "Enchanted creature can't attack, block, or transform.";
const MOVE_TEXT = "Sacrifice another permanent: Attach this Aura to target creature. Activate only as a sorcery and only once each turn.";

export default defineCard({
  name: "Bound by Moonsilver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${MOVE_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block"], text: STATIC_TEXT },
    { affects: { scope: "self" }, prohibits: [{ act: "transform", object: { hostOfSource: true } }], text: STATIC_TEXT },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: {} } },
      otherOnly: true,
      targets: ["creature"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: MOVE_TEXT,
      sorcerySpeed: true,
      oncePerTurn: true,
    },
  ],
});
