import { defineCard } from "../define.js";

// EDHREC rank 10180.
//
// Rulings:
//   [2026-08-21] If the resolution of a triggered ability involves casting a spell, that spell
//     can't be cast if a spell with split second is on the stack.
//   [2026-08-21] Split second doesn't stop triggered abilities from triggering. If one does, its
//     controller puts it on the stack and chooses targets for it, if any. Those abilities will
//     resolve as normal.
//   [2026-08-21] After a spell with split second resolves (or otherwise leaves the stack), players
//     may again cast spells and activate abilities before the next object on the stack resolves.
//   [2026-08-21] Players still get priority while a card with split second is on the stack; their
//     options are just limited to mana abilities and certain special actions.
//   [2026-08-21] Casting a spell with split second won't affect spells and abilities that are
//     already on the stack.

const SPLIT_TEXT =
  "Instant and sorcery spells you control have split second. (As long as a spell with split second is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)";

// "Spells you control", not "you cast": `grantsToSpells` reaches every spell
// on the stack its controller controls, a copy included, and only while
// Samut is on the battlefield (Shadow the Hedgehog's split second grant).
export default defineCard({
  name: "Samut, Tyrant of Naktamun",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: SPLIT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"] }, splitSecond: true },
      text: SPLIT_TEXT,
    },
  ],
});
