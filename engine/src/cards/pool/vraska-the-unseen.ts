import { defineCard } from "../define.js";

// EDHREC rank 7553. The +1 is a delayed triggered ability lasting until
// Vraska's controller's next turn (rule 603.7c), watching this Vraska only —
// one that leaves and comes back is a new object (rule 400.7). "That
// creature" is the creature that dealt the damage. The Assassins' trigger
// fires on combat damage to any player, their controller included (the
// ruling).
const PLUS_TEXT = "+1: Until your next turn, whenever a creature deals combat damage to Vraska, destroy that creature.";
const MINUS_TEXT = "−3: Destroy target nonland permanent.";
const ULT_TEXT =
  '−7: Create three 1/1 black Assassin creature tokens with "Whenever this token deals combat damage to a player, that player loses the game."';

export default defineCard({
  name: "Vraska the Unseen",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vraska"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "self", combat: true },
          until: "your-next-turn",
        },
        effect: { kind: "destroy", target: "trigger-object" },
        text: "Whenever a creature deals combat damage to Vraska, destroy that creature.",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Assassin Token (Vraska the Unseen)", count: 3 },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
