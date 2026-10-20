import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 12902.
//
// Rulings:
//   [2025-07-25] If Hardlight Containment leaves the battlefield before its triggered ability
//     resolves, the target creature won’t be exiled.
//   [2025-07-25] If a token is exiled this way, it will cease to exist and won’t return to the
//     battlefield.
//   [2025-07-25] Auras attached to the exiled creature will be put into their owners’ graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled creature will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.

const EXILE_TEXT =
  "When this Aura enters, exile target creature an opponent controls until this Aura leaves the battlefield.";
const WARD_TEXT = "Enchanted permanent has ward {1}.";

// Chains of Custody's shape, on an artifact you control.
export default defineCard({
  name: "Hardlight Containment",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact you control\n${EXILE_TEXT}\n${WARD_TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: WARD_TEXT,
    },
  ],
});
