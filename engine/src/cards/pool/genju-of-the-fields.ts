import { defineCard } from "../define.js";

// EDHREC rank 25776.
//
// Rulings:
//   [2005-02-01] When activated multiple times, it will have the triggered ability multiple
//     times. When the animated Plains deals damage, the ability will trigger once for each copy
//     of the ability.
//   [2009-10-01] Activating the ability that turns it into a creature while it's already a
//     creature will override any effects that set its power and/or toughness to a specific number.

const ANIMATE_TEXT =
  "{2}: Until end of turn, enchanted Plains becomes a 2/5 white Spirit creature with \"Whenever this creature deals damage, its controller gains that much life.\" It's still a land.";
const LIFE_TEXT = "Whenever this creature deals damage, its controller gains that much life.";
const RETURN_TEXT = "When enchanted Plains is put into a graveyard, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Genju of the Fields",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Plains\n${ANIMATE_TEXT}\n${RETURN_TEXT}`,
  targets: [{ kind: "permanent", filter: { subtype: "Plains" } }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "attached",
            power: 2,
            toughness: 5,
            addTypes: ["creature"],
            addSubtypes: ["Spirit"],
            setColors: ["W"],
            duration: "end-of-turn",
          },
          {
            // Den of the Bugbear's granted trigger; each activation grants
            // another copy (the ruling). The granted ability is controlled by
            // the Plains' controller, who gains the life.
            kind: "grant-triggered",
            target: "attached",
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-damage", who: "self" },
              targets: [],
              effect: { kind: "gain-life", amount: { triggerValue: true } },
              resolve: null,
              text: LIFE_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      // Genju of the Spires' return.
      trigger: { on: "leaves-battlefield", who: "attached", to: ["graveyard"] },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-zone", zones: ["graveyard"] },
            { kind: "source", filter: { ownedBy: "you" } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Return Genju of the Fields from your graveyard to your hand?",
          effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
