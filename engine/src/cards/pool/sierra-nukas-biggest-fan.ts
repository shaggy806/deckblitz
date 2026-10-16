import { defineCard } from "../define.js";

// EDHREC rank 9593. Fallout.
//
// Rulings:
//   [2024-03-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, if you sacrifice a nontoken Food artifact, such as Candy Trail
//     from the Wilds of Eldraine set, Sierra's last ability will trigger.
//   [2024-03-08] Sierra's last ability triggers whenever you sacrifice a Food for any reason, not
//     just to activate a Food's activated ability.
//
// The Nuka-Cola Challenge is Rapacious Guest's batch trigger (once per
// combat damage step, however many creatures connected). The sacrifice
// trigger reads any Food, token or not, as it last existed; X is the quest
// counters on Sierra as it resolves.
const CHALLENGE_TEXT =
  "The Nuka-Cola Challenge — Whenever one or more creatures you control deal combat damage to a player, put a quest counter on Sierra and create a Food token.";
const FOOD_TEXT =
  "Whenever you sacrifice a Food, target creature you control gets +X/+X until end of turn, where X is the number of quest counters on Sierra.";
const QUESTS = { countersOn: "source", counter: "quest" } as const;

export default defineCard({
  name: "Sierra, Nuka's Biggest Fan",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 4,
  text: `${CHALLENGE_TEXT}\n${FOOD_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: CHALLENGE_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Food" } },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: QUESTS, toughness: QUESTS, duration: "end-of-turn" },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
});
