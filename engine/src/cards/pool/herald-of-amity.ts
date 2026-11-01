import { defineCard } from "../define.js";

// SOC. The eight are exiled, not looked at
// (they're public, and "whenever a card is put into exile" sees them); an
// Aura may be cast from among them as this resolves, timing ignored, and the
// rest — still exiled — go to the bottom in a random order.
//
// Rulings:
//   [2026-03-20] If the exiled Aura has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.
//   [2026-03-20] You cast the spell while Herald of Amity's second ability is resolving and still
//     on the stack. You can't wait to cast it later in the turn. Timing restrictions based on the
//     card's types are ignored.

const ENTER_TEXT =
  "When this creature enters, exile the top eight cards of your library. You may cast an Aura spell from among them without paying its mana cost. Then put the rest on the bottom of your library in a random order.";
const ATTACK_TEXT = "Whenever this creature attacks, it gets +X/+X until end of turn, where X is the number of Auras you control.";

export default defineCard({
  name: "Herald of Amity",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 8 },
          { kind: "cast-now", from: "exiled-this-way", free: true, spell: { subtype: "Aura" } },
          { kind: "move-exiled-this-way", to: "library-bottom" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { subtype: "Aura", controlledBy: "you" } },
        toughness: { countOf: { subtype: "Aura", controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
