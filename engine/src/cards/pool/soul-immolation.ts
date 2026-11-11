import { defineCard } from "../define.js";

// X is announced as it's cast though the mana cost has no {X} (rules 107.3a, 601.2b), no more
// than the greatest toughness among the caster's creatures as they announce it. The counters all
// go on one creature, chosen as the cost is paid (601.2h, 701.68a) — any of theirs, not only the
// toughest. Castable only with a creature to blight (701.68b). Not an {X} in its mana cost: its
// mana value stays 5. The opponents and their creatures are dealt the damage together.

export default defineCard({
  name: "Soul Immolation",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, blight X. X can't be greater than the greatest toughness among creatures you control. (Put X -1/-1 counters on a creature you control.)\nSoul Immolation deals X damage to each opponent and each creature they control.",
  additionalCost: { also: { text: "Blight X", do: { kind: "blight", amount: "x" } } },
  maxX: { aggregate: "max", of: "toughness", filter: { type: "creature", controlledBy: "you" } },
  effect: {
    // One instruction: the players and their creatures are dealt it together.
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: "x", who: "each-opponent" },
      { kind: "damage-all", filter: { type: "creature" }, whose: "each-opponent", amount: "x" },
    ],
  },
});
