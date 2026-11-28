import { defineCard } from "../define.js";

// EDHREC rank 30650. Monstrous Step's shape with a required second slot. Its
// rulings: a first target gone illegal gets no counter, but the second still
// has to block it if able (rule 608.2b: the requirement only names it, held
// through `illegalHeld`); a second gone illegal is under no requirement.

export default defineCard({
  name: "Feral Contest",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control. Another target creature blocks it this turn if able.",
  targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "restrict", target: 1, restrictions: [{ kind: "must-block", attacker: 0 }] },
    ],
  },
});
