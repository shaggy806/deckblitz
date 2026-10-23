import { defineCard } from "../define.js";

// EDHREC rank 18402.
//
// Rulings:
//   [2018-03-16] You can activate the ability Lunarch Mantle grants to your enchanted creature by
//     sacrificing any permanent you control, including Lunarch Mantle or the enchanted creature
//     itself. If you sacrifice Lunarch Mantle this way, the creature it previously enchanted still
//     gains flying.
//   [2018-03-16] Only the player who controls the enchanted creature can activate the ability it
//     gains from Lunarch Mantle. This might not be the controller of Lunarch Mantle.
//
// The granted ability is the creature's own, so its controller activates it,
// and its source is the creature: the flying lands on it even once the Mantle
// is gone (Claws of Gix's "Sacrifice a permanent" cost).

const GRANTED_TEXT = "{1}, Sacrifice a permanent: This creature gains flying until end of turn.";
const TEXT = `Enchanted creature gets +2/+2 and has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Lunarch Mantle",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: { filter: {} } },
          targets: [],
          effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
