import { defineCard } from "../define.js";

// "Permanents you don't own" are those an opponent owns: every other player
// is an opponent (no teams). Arvinox counts itself when an opponent owns it.
const CREATURE_TEXT = "Arvinox isn't a creature unless you control three or more permanents you don't own.";
const END_TEXT =
  "At the beginning of your end step, exile the bottom card of each opponent's library face down. For as long as those cards remain exiled, you may look at them, you may cast permanent spells from among them, and you may spend mana as though it were mana of any color to cast those spells.";

export default defineCard({
  name: "Arvinox, the Mind Flail",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Horror"],
  power: 9,
  toughness: 9,
  text: `${CREATURE_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { ownedBy: "opponent" }, atLeast: 3, countsSelf: true },
      },
      removeTypes: ["creature"],
      text: CREATURE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // Face down, the controller alone may look at them (rule 406.3); the
      // permission lasts while each stays exiled (400.7).
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-opponent",
        fromBottom: true,
        faceDown: true,
        duration: "while-exiled",
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"] },
        spendAs: "any-color",
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
