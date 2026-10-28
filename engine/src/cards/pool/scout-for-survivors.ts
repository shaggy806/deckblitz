import { defineCard } from "../define.js";

// EDHREC rank 13734.
//
// The cards enter together, then each gets its counter (not "enters with").

export default defineCard({
  name: "Scout for Survivors",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return up to three target creature cards with total mana value 3 or less from your graveyard to the battlefield. Put a +1/+1 counter on each of them.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      max: 3,
      maxTotalManaValue: 3,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
    ],
  },
});
