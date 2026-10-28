import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

const EXILE_TEXT =
  "Whenever a creature you control deals combat damage to a player, exile the top card of that player's library face down. You may look at it for as long as it remains exiled.";
const MENACE_TEXT = "Creatures you control have menace.";
const PLAY_TEXT =
  "You may play cards exiled with this Class, and you may spend mana as though it were mana of any color to cast those spells.";

export default defineCard({
  name: "Rogue Class",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${EXILE_TEXT}\n{1}{U}{B}: Level 2\n${MENACE_TEXT}\n{2}{U}{B}: Level 3\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      // Exiled face down, for its controller's eyes only (the "look" clause).
      // The level-3 permission rides on each exiled card: linked to this
      // Class as the same object on the battlefield (`while-source` — "cards
      // exiled with this Class", each Rogue Class its own), and usable only
      // while the Class is level 3 (`gate`, read off the Class), with mana
      // spent as though of any colour for a spell cast that way.
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "trigger-player",
        duration: "while-source",
        faceDown: true,
        gate: { kind: "class-level", atLeast: 3 },
        spendAs: "any-color",
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    atLevel(2, {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["menace"],
      text: MENACE_TEXT,
    }),
  ],
  activated: [classLevel(2, "{1}{U}{B}"), classLevel(3, "{2}{U}{B}")],
});
