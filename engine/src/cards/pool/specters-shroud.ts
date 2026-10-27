import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 21266. The swords' "whenever equipped creature deals
// combat damage to a player" trigger, with Banshee of the Dread Choir's
// discard for "that player".

const TRIGGER_TEXT = "Whenever equipped creature deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Specter's Shroud",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0.\n${TRIGGER_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
