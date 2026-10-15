import { defineCard } from "../define.js";

// EDHREC rank 24683. Secrets of Strixhaven.
//
// The cast trigger resolves before the spell, even one that's countered (the
// ruling).
const BOUNCE_TEXT = "When this creature enters, return up to one other target creature to its owner's hand.";
const X_TEXT = "Whenever you cast a spell with {X} in its mana cost, this creature can't be blocked this turn.";

export default defineCard({
  name: "Matterbending Mage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${BOUNCE_TEXT}\n${X_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { xInManaCost: true } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: X_TEXT,
    },
  ],
});
