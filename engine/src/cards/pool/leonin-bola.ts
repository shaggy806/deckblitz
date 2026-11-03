import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings:
//   Leonin Bola grants an ability to the equipped creature. The ability can target a creature with
//     protection from artifacts (unless the equipped creature is an artifact creature).
//   "Unattach Leonin Bola" means just that — Leonin Bola moves off the creature it was equipping and
//     remains on the battlefield.
//   The equipped creature's controller chooses whether or not to activate the activated ability. It
//     doesn't matter who controls Leonin Bola.

const GRANTED = "{T}, Unattach Leonin Bola: Tap target creature.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Leonin Bola",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, unattach: "granter" },
          targets: ["creature"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
});
