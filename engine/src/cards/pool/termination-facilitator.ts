import { defineCard } from "../define.js";

// EDHREC rank 9503.
//
// "Destroy it" has no intervening if: the trigger checks for the bounty
// counter as the damage is dealt, and destroys the permanent as it resolves
// whether or not the counter is still there.
const BOUNTY_TEXT = "{T}: Put a bounty counter on target creature or planeswalker. Activate only as a sorcery.";
const DESTROY_TEXT =
  "Whenever a creature or planeswalker an opponent controls with a bounty counter on it is dealt damage, destroy it.";

export default defineCard({
  name: "Termination Facilitator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 3,
  text: `${BOUNTY_TEXT}\n${DESTROY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "add-counter", target: 0, counter: "bounty", amount: 1 },
      resolve: null,
      text: BOUNTY_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dealt-damage",
        who: "opponent",
        filter: {
          typesAnyOf: ["creature", "planeswalker"],
          counters: { kind: "bounty", compare: { op: "gte", n: 1 } },
        },
      },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
