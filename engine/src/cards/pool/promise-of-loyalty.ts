import { defineCard } from "../define.js";

// EDHREC rank 937.
//
// Divine Reckoning's choice, the caster included, none opting out (the
// rulings): the active player first, each knowing the choices before theirs.
// The counters go on, then the rest are sacrificed at once. The restriction is
// on each creature itself, "you" this spell's controller, so it stays through a
// change of control and ends once that creature has no vow counter, however
// the counter went, a new one later not bringing it back (rule 611.2b; the
// rulings).

export default defineCard({
  name: "Promise of Loyalty",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player puts a vow counter on a creature they control and sacrifices the rest. Each of those creatures can't attack you or planeswalkers you control for as long as it has a vow counter on it.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true, keep: true },
      },
      { kind: "add-counter-all", filter: { thisWay: "chosen" }, counter: "vow", amount: 1 },
      { kind: "sacrifice-all", who: "each-player", filter: { type: "creature", notThisWay: "chosen" } },
      {
        kind: "restrict",
        filter: { thisWay: "chosen" },
        asItResolves: true,
        restrictions: [{ kind: "cant-attack", at: "you-and-planeswalkers" }],
        
        duration: { whileCounter: "vow" },
      },
    ],
  },
});
