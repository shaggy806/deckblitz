import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 13830.
//
// The target is chosen as the trigger goes on the stack, among the damaged
// player's creatures; it's rechecked as the ability resolves, so a creature
// that player no longer controls is an illegal target and nothing happens.
// Otherwise its controller — still that player — sacrifices it (the ruling).

const TEXT =
  "Whenever Ashling deals combat damage to a player, choose target creature that player controls. The player sacrifices that creature.";

export default defineCard({
  name: "Ashling, the Extinguisher",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "sacrifice-target", target: 0, byItsController: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
