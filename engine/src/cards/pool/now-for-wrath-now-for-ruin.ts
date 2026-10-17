import { defineCard } from "../define.js";

// EDHREC rank 12782.
//
// Rulings:
//   [2023-06-16] Each time the Ring tempts you, you must choose a creature if you control one.
//   [2023-06-16] Each player can have only one emblem named The Ring and only one Ring-bearer at a
//     time.
//   [2023-06-16] If the creature you choose as your Ring-bearer was already your Ring-bearer, that
//     still counts as choosing that creature as your Ring-bearer for the purpose of abilities that
//     trigger "whenever you choose a creature as your Ring-bearer" or abilities that care about
//     which creature was chosen as your Ring-bearer.
//   [2023-06-16] The Ring gains its abilities in order from top to bottom. Once it gains an
//     ability, it has that ability for the rest of the game.
//   [2023-06-16] As the Ring tempts you, you get an emblem named The Ring if you don't have one.
//     Then your emblem gains its next ability and you choose a creature you control to become (or
//     remain) your Ring-bearer.
//   [2023-06-16] The Ring can tempt you even if you don't control a creature. In this case,
//     abilities that trigger "whenever the Ring tempts you" will still trigger.
//   [2023-06-16] Some spells and abilities that cause the Ring to tempt you may require targets.
//     If each target chosen is an illegal target as that spell or ability tries to resolve, it
//     won't resolve. The Ring won't tempt you.

export default defineCard({
  name: "Now for Wrath, Now for Ruin!",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on each creature you control. They gain vigilance until end of turn. The Ring tempts you.",
  // "They" are the creatures you control as it resolves — the same ones the
  // counters went on, nothing happening between the two.
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
      { kind: "the-ring-tempts-you" },
    ],
  },
});
