import { defineCard } from "../define.js";

const THOSE = { thisWay: "control-effect" } as const;

// EDHREC rank 7475.
// "Those creatures" are the ones control was gained of, fixed as it resolves
// (rule 611.2c). "You can't sacrifice" them is a rule over you and those
// creatures, not an ability of theirs: asked to sacrifice one, you can't and
// it stays, and none of them pays a sacrifice cost (the rulings). "You can't
// attack that player" leaves their planeswalkers and everyone else open, and
// binds creatures you get later this turn too.
export default defineCard({
  name: "Call for Aid",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of all creatures target opponent controls until end of turn. Untap those creatures. They gain haste until end of turn. You can't attack that player this turn. You can't sacrifice those creatures this turn.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control-all", filter: { type: "creature" }, untilEndOfTurn: true, controlledByTarget: 0 },
      { kind: "untap-all", filter: THOSE },
      { kind: "grant-keyword-all", filter: THOSE, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        restrictions: [{ kind: "cant-attack", at: { target: 0 } }],
      },
      { kind: "cant-be-sacrificed", filter: THOSE, by: "you", duration: "end-of-turn" },
    ],
  },
});
