import { defineCard } from "../define.js";

// EDHREC rank 17173.

export default defineCard({
  name: "Jaya Ballard, Task Mage",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: "{R}, {T}, Discard a card: Destroy target blue permanent.\n{1}{R}, {T}, Discard a card: Jaya Ballard deals 3 damage to any target. A creature dealt damage this way can't be regenerated this turn.\n{5}{R}{R}, {T}, Discard a card: Jaya Ballard deals 6 damage to each creature and each player.",
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "permanent", filter: { colors: ["U"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{R}, {T}, Discard a card: Destroy target blue permanent.",
    },
    {
      cost: { mana: "{1}{R}", tap: true, discard: { count: 1 } },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "cant-regenerate", dealtDamageThisWay: "creature" },
        ],
      },
      resolve: null,
      text: "{1}{R}, {T}, Discard a card: Jaya Ballard deals 3 damage to any target. A creature dealt damage this way can't be regenerated this turn.",
    },
    {
      cost: { mana: "{5}{R}{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 6 },
          { kind: "damage", amount: 6, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{5}{R}{R}, {T}, Discard a card: Jaya Ballard deals 6 damage to each creature and each player.",
    },
  ],
});
