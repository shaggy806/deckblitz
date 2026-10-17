import { defineCard } from "../define.js";

// "One or two target creatures": a slot, then an optional second one that
// can't be the first (one instance of "target", rule 601.2c).
export default defineCard({
  name: "Become Brutes",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "One or two target creatures each gain haste until end of turn. For each of those creatures, create a Monster Role token attached to it. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 and has trample.)",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "haste", duration: "end-of-turn" },
      { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 },
      { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 1 },
    ],
  },
});
