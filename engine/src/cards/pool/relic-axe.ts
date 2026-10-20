import { defineCard } from "../define.js";

// EDHREC rank 19541. Zendikar Rising.
//
// "+1/+1, or +2/+1 instead if it's a Warrior" is +1/+1 always and +1/+0 more
// while the Equipment is attached to a Warrior (Akki War Paint's
// `attachedTo` source condition) — the same totals either way.

const BONUS_TEXT = "Equipped creature gets +1/+1. If it's a Warrior, it gets +2/+1 instead.";

export default defineCard({
  name: "Relic Axe",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `When this Equipment enters, attach it to target creature you control.\n${BONUS_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: "When this Equipment enters, attach it to target creature you control.",
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: BONUS_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Warrior" } } },
      grantPt: [1, 0],
      text: BONUS_TEXT,
    },
  ],
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
});
