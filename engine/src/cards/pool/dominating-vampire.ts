import { defineCard } from "../define.js";

// The mana-value limit is read as the target is chosen and again as the
// ability resolves (rule 608.2b); once it has resolved, control lasts until
// end of turn whatever happens to the number of Vampires (the ruling).
const TEXT =
  "When this creature enters, gain control of target creature with mana value less than or equal to the number of Vampires you control until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Dominating Vampire",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            manaValue: { op: "lte", n: { amount: { countOf: { subtype: "Vampire", controlledBy: "you" } } } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
