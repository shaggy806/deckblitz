import { defineCard } from "../define.js";
import { fortify } from "../helpers.js";

// EDHREC rank 14380. A Fortification goes on a land as an Equipment goes on a
// creature (rule 301.6). Its trigger targets, so it's no mana ability (rule
// 605.1b): it triggers as the land's mana ability resolves and produces mana
// (106.12a) and waits on the stack, and "the mana that land produced" is what
// that ability made (`LastKnownRefs.manaProduced`) — the creature need only
// be one of its colors (the second ruling), and colorless mana is none.
//
// Rulings:
//   [2024-03-08] Fortification is to lands what Equipment is to creatures. Except for the difference
//     regarding what type of permanent they can be attached to, Fortifications and Equipment follow
//     the same rules.
//   [2024-03-08] If the fortified land produced more than one color of mana, you'll create a Junk
//     token as long as the target creature is at least one of those colors.
//   [2024-03-08] Some spells and abilities that create Junk tokens may require targets. If each
//     target chosen is illegal as that spell or ability tries to resolve, it won't resolve and none
//     of its effects happen. You won't create any Junk tokens.
const TAP_TEXT =
  "Whenever fortified land is tapped for mana, put a +1/+1 counter on target creature you control. If that creature shares a color with the mana that land produced, create a Junk token. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")";

export default defineCard({
  name: "C.A.M.P.",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Fortification"],
  text: `${TAP_TEXT}\nFortify {3} ({3}: Attach to target land you control. Fortify only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { sharesColorWithMana: "produced" } },
            then: { kind: "create-token", token: "Junk Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  activated: [fortify("{3}")],
});
