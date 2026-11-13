import { defineCard } from "../define.js";

// EDHREC rank 4314. The creature cards you own have flash themselves, in
// every zone but the battlefield (rule 113.6) — your hand, the command zone, a
// graveyard or exile you may cast from — so any timing that asks "could you
// begin to cast this" (suspend's, rule 702.62a) sees it too. The last line is
// Teferi, Time Raveler's: a restriction, which wins over any permission to
// cast at another time (rule 101.2), and stops a spell an effect would have
// an opponent cast while it's resolving.
//
// Rulings:
//   - Teferi's last ability means that in order for an opponent to cast a spell, it must be that
//     opponent's turn, during a main phase, and the stack must be empty. This is true even if a
//     rule or effect allows a sorcery to be cast at another time.
//   - If an effect allows an opponent to cast spells any time they could cast an instant (for
//     example, if your opponent also controls Teferi), the restriction of Teferi's last ability
//     takes precedence over that permission.
//   - If a spell on the stack has split second while you control Teferi, you can't suspend
//     creature cards since split second stops you from casting them, even though suspending them
//     is a special action.
//   - While you control Teferi, you may exile creature cards in your hand with suspend any time
//     you could cast an instant.
//   - If a spell or ability lets an opponent cast a spell as part of its effect (such as suspend
//     and rebound do), that opponent can't cast that spell since the resolving ability is still
//     on the stack. This is true even if the spell is an instant.

const FLASH_TEXT = "Creature cards you own that aren't on the battlefield have flash.";
const TIMING_TEXT = "Each opponent can cast spells only any time they could cast a sorcery.";

export default defineCard({
  name: "Teferi, Mage of Zhalfir",
  manaCost: "{2}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${FLASH_TEXT}\n${TIMING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      outsideBattlefield: { ofType: ["creature"], keywords: ["flash"] },
      text: FLASH_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "opponents", unless: "sorcery-timing" }],
      text: TIMING_TEXT,
    },
  ],
});
