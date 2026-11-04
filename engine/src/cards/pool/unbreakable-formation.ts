import { defineCard } from "../define.js";

// EDHREC rank 564.
// Rulings:
//   [2019-01-25] Unbreakable Formation affects only creatures you control at the time it resolves.
//     Creatures you begin to control later in the turn won't gain indestructible or vigilance and
//     they won't get a +1/+1 counter.
//   [2019-01-25] If an effect copies a spell with an addendum ability while it's on the stack, the
//     copy wasn't cast at all, so you won't get the addendum bonus.
//
// Addendum is asked as the spell resolves (the ruling): a spell cast in your
// main phase resolves in that phase, so "it was cast and it's now your main
// phase" is the same question. "Those creatures" are the same creatures all
// through one resolution: nothing can change who controls what between its
// instructions (rule 608.2).
const CREATURES = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Unbreakable Formation",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control gain indestructible until end of turn.\nAddendum — If you cast this spell during your main phase, put a +1/+1 counter on each of those creatures and they gain vigilance until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: CREATURES, keyword: "indestructible", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "your-turn" },
            { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter-all", filter: CREATURES, counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword-all", filter: CREATURES, keyword: "vigilance", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
