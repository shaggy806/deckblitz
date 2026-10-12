import { defineCard } from "../define.js";

// EDHREC rank 9158.
const LANDFALL = "Landfall — Whenever a land you control enters, put a charge counter on this artifact.";
const ANY = "{T}: Add one mana of any color.";
const COLORLESS = "{T}, Remove two charge counters from this artifact: Add {C}{C}.";
const DAMAGE = "{T}, Remove three charge counters from this artifact: It deals 3 damage to any target.";

export default defineCard({
  name: "Weather Maker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${LANDFALL}\n${ANY}\n${COLORLESS}\n${DAMAGE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: ANY,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 2 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 2 },
      resolve: null,
      text: COLORLESS,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 3 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: DAMAGE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: LANDFALL,
    },
  ],
});
