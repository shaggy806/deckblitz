import { defineCard } from "../define.js";

// EDHREC rank 9836.

export default defineCard({
  name: "Brotherhood Outcast",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, choose one —\n• Return target Aura or Equipment card with mana value 3 or less from your graveyard to the battlefield.\n• Put a shield counter on target creature. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Return target Aura or Equipment card with mana value 3 or less from your graveyard to the battlefield.",
            targets: [
              {
                kind: "card-in-graveyard",
                whose: "you",
                filter: { anyOf: [{ subtype: "Aura" }, { subtype: "Equipment" }], manaValue: { op: "lte", n: 3 } },
              },
            ],
            // An Aura returned this way is attached to what its owner
            // chooses as it enters (rule 303.4f), not targeted.
            effect: { kind: "put-onto-battlefield", target: 0 },
          },
          { text: "Put a shield counter on target creature.", targets: ["creature"], effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
