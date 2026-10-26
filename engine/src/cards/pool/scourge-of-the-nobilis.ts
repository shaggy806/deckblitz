import { defineCard } from "../define.js";

// EDHREC rank 18629.
//
// Rulings:
//   [2008-08-01] Once the +1/+0 ability is activated, it exists independently of the creature and
//     Scourge of the Nobilis.
//   [2008-08-01] The controller of the enchanted creature, not the controller of Scourge of the
//     Nobilis, can activate the +1/+0 ability.
//   [2008-08-01] If the enchanted creature is both of the listed colors, it will get both bonuses.

const PUMP_TEXT = "{R/W}: This creature gets +1/+0 until end of turn.";
const RED_TEXT = `As long as enchanted creature is red, it gets +1/+1 and has "${PUMP_TEXT}"`;
const WHITE_TEXT =
  "As long as enchanted creature is white, it gets +1/+1 and has lifelink. (Damage dealt by the creature also causes its controller to gain that much life.)";

export default defineCard({
  name: "Scourge of the Nobilis",
  manaCost: "{2}{R/W}",
  colors: ["R", "W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${RED_TEXT}\n${WHITE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["R"] } } },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: "{R/W}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: RED_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["W"] } } },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: WHITE_TEXT,
    },
  ],
});
