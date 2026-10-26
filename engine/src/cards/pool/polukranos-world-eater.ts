import { defineCard } from "../define.js";

// EDHREC rank 11010. The trigger's X is the X the monstrosity ability was
// activated with (the ruling) — the `becomes-monstrous` trigger value, as
// Hydra Broodmaster reads it — split among the targets as the ability goes on
// the stack (`divided.byTriggerValue`, at least 1 each). Polukranos deals its
// damage first, then each target still there deals damage equal to its power
// to Polukranos (a one-sided fight, which isn't a fight — Predatory Urge).
const MONSTROSITY_TEXT =
  "{X}{X}{G}: Monstrosity X. (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)";
const MONSTROUS_TEXT =
  "When Polukranos becomes monstrous, it deals X damage divided as you choose among any number of target creatures your opponents control. Each of those creatures deals damage equal to its power to Polukranos.";

export default defineCard({
  name: "Polukranos, World Eater",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 5,
  toughness: 5,
  text: `${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{X}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: "x" },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [{ kind: "any-number", of: "creature-an-opponent-controls" }],
      divided: { total: 0, slot: 0, byTriggerValue: true },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-divided", from: 0 },
          { kind: "for-each-target", from: 0, effect: { kind: "fight", a: 0, b: "source", oneSided: true } },
        ],
      },
      resolve: null,
      text: MONSTROUS_TEXT,
    },
  ],
});
