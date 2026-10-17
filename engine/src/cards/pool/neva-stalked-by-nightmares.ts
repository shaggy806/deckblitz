import { defineCard } from "../define.js";

// EDHREC rank 10194.
//
// Rulings:
//   [2023-09-01] Enchantment tokens (such as Roles) that are sacrificed, destroyed, or would
//     otherwise go to the graveyard are put into their owner's graveyard before ceasing to exist.
//     If you controlled the token, Neva's ability will trigger.
//   [2023-09-01] If Neva leaves the battlefield while it has an Aura you control attached to it or
//     at the same time as another creature with an Aura you control attached to it, its ability
//     won't trigger for those enchantments unless they were destroyed by the same effect that
//     caused Neva to leave the battlefield.
//
// The last ability is a leaves-the-battlefield trigger that looks back (rule
// 603.10a): an Aura put into the graveyard by state-based actions after Neva
// has gone finds no Neva to trigger.

const RETURN_TEXT = "When Neva enters, return target creature or enchantment card from your graveyard to your hand.";
const GROW_TEXT =
  "Whenever an enchantment you control is put into a graveyard from the battlefield, put a +1/+1 counter on Neva, then scry 1.";

export default defineCard({
  name: "Neva, Stalked by Nightmares",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${RETURN_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["creature", "enchantment"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
