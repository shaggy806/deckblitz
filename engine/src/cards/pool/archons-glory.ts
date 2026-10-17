import { defineCard } from "../define.js";

// EDHREC rank 19225.
//
// Rulings:
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."

export default defineCard({
  name: "Archon's Glory",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  // Bargained (rule 702.166b): the pump, and flying and lifelink too.
  kicker: {
    cost: "",
    keyword: "bargain",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      ],
    },
  },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nTarget creature gets +2/+2 until end of turn. If this spell was bargained, that creature also gains flying and lifelink until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
});
