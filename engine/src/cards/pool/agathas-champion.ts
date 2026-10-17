import { defineCard } from "../define.js";

// EDHREC rank 24505.
//
// Rulings:
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."

export default defineCard({
  name: "Agatha's Champion",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  kicker: { cost: "", keyword: "bargain" },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nTrample\nWhen this creature enters, if it was bargained, it fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Thorn Mammoth's "fights up to one target creature you don't control".
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: "When this creature enters, if it was bargained, it fights up to one target creature you don't control.",
      condition: { kind: "self-kicked" },
    },
  ],
});
