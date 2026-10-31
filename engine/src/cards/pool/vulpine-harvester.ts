import { defineCard } from "../define.js";

// Rulings:
//   [2023-04-14] The total power of the attacking Phyrexians is checked as the ability resolves.
//     Use the power of each of those creatures at that time, even if the creature is no longer
//     attacking or no longer a Phyrexian. If the creature isn't on the battlefield, use its power
//     from when it was last on the battlefield. If the artifact card's mana value is greater
//     than the total power, it stays in your graveyard.

const ATTACK_TEXT =
  "Whenever one or more Phyrexians you control attack, return target artifact card from your graveyard to the battlefield if its mana value is less than or equal to their total power.";

export default defineCard({
  name: "Vulpine Harvester",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Fox"],
  power: 3,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Phyrexian", controlledBy: "you" } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: {
            manaValue: {
              op: "lte",
              n: { amount: { aggregate: "sum", of: "power", filter: {}, in: "attackers" } },
            },
          },
        },
        then: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
