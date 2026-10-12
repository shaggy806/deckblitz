import { defineCard } from "../define.js";

// EDHREC rank 6893.

const TEXT =
  "{2}, {T}: Target opponent gains control of another target permanent you control. If they do, you draw a card.";

// "If they do": the permanent is an opponent's once the control change has
// applied. Either target illegal as it resolves, control doesn't change and
// nothing is drawn (rule 608.2b).
export default defineCard({
  name: "Stiltzkin, Moogle Merchant",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moogle"],
  power: 1,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["opponent", { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 1, who: { target: 0 }, untilEndOfTurn: false },
          {
            kind: "conditional",
            condition: { kind: "target", index: 1, filter: { controlledBy: "opponent" } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
