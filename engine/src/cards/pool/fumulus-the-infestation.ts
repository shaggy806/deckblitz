import { defineCard } from "../define.js";

// EDHREC rank 4862.
//
// Rulings:
//   [2024-11-08] If a nontoken creature is sacrificed to pay a cost of a spell or ability,
//     Fumulus's second ability will resolve before that spell or ability.
//   [2024-11-08] If you sacrifice Fumulus, its second ability will still trigger.

const SACRIFICE_TEXT = "Whenever a player sacrifices a nontoken creature, create a 1/1 black Insect creature token with flying.";
const ATTACK_TEXT =
  "Whenever an Insect, Leech, Slug, or Worm you control attacks, defending player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Fumulus, the Infestation",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${SACRIFICE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "any", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token (Black, Flying)", count: 1 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtypes: ["Insect", "Leech", "Slug", "Worm"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
