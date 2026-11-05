import { defineCard } from "../define.js";

// The reduction counts each card type among the permanents you sacrificed
// this turn once (`turnHistory` with `cardTypes`), generic only — never below
// {B}{R}{G} (the rulings). X is the permanent types among your graveyard's
// cards (artifact, battle, creature, enchantment, land, planeswalker — the
// ruling), read as the trigger resolves.

const TRIGGER_TEXT =
  "Whenever Korvold deals combat damage to a player, put X +1/+1 counters on Korvold and draw X cards, where X is the number of permanent types among cards in your graveyard.";
const PERMANENT_TYPES = {
  aggregate: "distinct",
  of: "permanent-type",
  filter: { ownedBy: "you" },
  in: "graveyards",
} as const;

export default defineCard({
  name: "Korvold, Gleeful Glutton",
  manaCost: "{5}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Noble"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample", "haste"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnHistory: "sacrificed", cardTypes: true },
  },
  text: `This spell costs {1} less to cast for each card type among permanents you've sacrificed this turn.\nFlying, trample, haste\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: PERMANENT_TYPES },
          { kind: "draw", amount: PERMANENT_TYPES },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
