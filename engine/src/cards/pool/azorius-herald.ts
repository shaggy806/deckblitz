import { defineCard } from "../define.js";

// Rulings:
//   [2006-05-01] If this enters in a way other than announcing it as a spell, then the appropriate
//     mana can't have been paid, and you'll have to sacrifice it.

const SAC = "When this creature enters, sacrifice it unless {U} was spent to cast it.";

export default defineCard({
  name: "Azorius Herald",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `This creature can't be blocked.\nWhen this creature enters, you gain 4 life.\n${SAC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "When this creature enters, you gain 4 life.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Not an intervening if: the trigger always goes on the stack, and the
      // mana spent is read as it resolves (a permanent that wasn't cast had
      // none spent, so it's sacrificed — the ruling).
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
