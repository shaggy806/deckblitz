import { defineCard } from "../define.js";

// Rulings:
//   Some spells cause other objects to deal damage, such as spells that cause two creatures to
//     fight. Rem Karolus's last two abilities don't apply to damage from such effects.
//   Rem Karolus's last two abilities apply only to damage dealt by spells on the stack. A spell
//     that becomes a permanent and then deals damage won't be affected.
//   The additional 1 damage is dealt by the original source of damage.

const PREVENT = "If a spell would deal damage to you or another permanent you control, prevent that damage.";
const PLUS =
  "If a spell would deal damage to an opponent or a permanent an opponent controls, it deals that much damage plus 1 instead.";

export default defineCard({
  name: "Rem Karolus, Stalwart Slayer",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${PREVENT}\n${PLUS}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true },
        source: { isSpell: true },
        to: "your-side",
        toOther: true,
      },
      text: PREVENT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { modify: { plus: 1 } },
        source: { isSpell: true },
        to: "opponent-side",
      },
      text: PLUS,
    },
  ],
});
