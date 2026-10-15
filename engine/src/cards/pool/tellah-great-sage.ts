import { defineCard } from "../define.js";

// EDHREC rank 8812.
// Makes Hero → use "Hero Token (Black Mage's Rod)" (a 1/1 colorless Hero).
//
// Rulings:
//   [2025-06-06] If Tellah is no longer on the battlefield when its ability resolves and eight or
//     more mana was spent to cast the spell that caused its ability to trigger, the ability will
//     still deal damage to each opponent.
//   [2025-06-06] Tellah's ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack.
//
// "That spell" is the trigger object; the mana spent on it (Thunderdrum
// Soloist's opus check) is read as the ability resolves, the spell gone or not.
// "Sacrifice Tellah and it deals that much damage" isn't an "if you do": the
// damage is dealt by Tellah as it last existed even when there was nothing
// left to sacrifice (the first ruling).

const TEXT =
  "Whenever you cast a noncreature spell, create a 1/1 colorless Hero creature token. If four or more mana was spent to cast that spell, draw two cards. If eight or more mana was spent to cast that spell, sacrifice Tellah and it deals that much damage to each opponent.";

export default defineCard({
  name: "Tellah, Great Sage",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 4 } } },
            then: { kind: "draw", amount: 2 },
          },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 8 } } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "damage", who: "each-opponent", amount: { manaSpentOf: "trigger-object" } },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
