import { defineCard } from "../define.js";

// EDHREC rank 6492. A creature dealt lethal damage by the first ability
// becomes a Vampire before it dies (state-based actions wait for the whole
// resolution — the ruling). The steal ends when you stop controlling Olivia,
// and does nothing if you already don't as it resolves (the ruling, rule
// 611.2b).
const PING_TEXT =
  "{1}{R}: Olivia Voldaren deals 1 damage to another target creature. That creature becomes a Vampire in addition to its other types. Put a +1/+1 counter on Olivia Voldaren.";
const STEAL_TEXT = "{3}{B}{B}: Gain control of target Vampire for as long as you control Olivia Voldaren.";

export default defineCard({
  name: "Olivia Voldaren",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PING_TEXT}\n${STEAL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "add-types", target: 0, addSubtypes: ["Vampire"], duration: "permanent" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: PING_TEXT,
    },
    {
      cost: { mana: "{3}{B}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Vampire" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
