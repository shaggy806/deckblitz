import { defineCard } from "../define.js";

// EDHREC rank 21574.
//
// The block trigger's prevention is two `damage-rule` shields on this
// creature for the turn (Elvish Scout's to-and-by); "target creature it's
// blocking" is `blockingRelation: "blocked-by"` (Tinder Wall).
const BLOCK_TEXT = "Whenever this creature blocks, prevent all combat damage that would be dealt to and dealt by it this turn.";
const PING_TEXT = "{T}: This creature deals 1 damage to target creature it's blocking.";

export default defineCard({
  name: "Goblin Snowman",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: `${BLOCK_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: "source" }, combat: true },
          { kind: "damage-rule", by: { target: "source" }, combat: true },
        ],
      },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocked-by" } } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
