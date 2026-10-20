import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// The second mode is Reveillark's: one instruction over both targets, so
// they return at once (`simultaneous`).
const MODE_ONE =
  "Return target creature card from your graveyard to the battlefield with an additional +1/+1 counter on it.";
const MODE_TWO =
  "Return up to two target creature cards with power 2 or less from your graveyard to the battlefield.";
const smallCreatureCard: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { type: "creature", power: { op: "lte", n: 2 } },
};

export default defineCard({
  name: "Graceful Restoration",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${MODE_ONE}\n• ${MODE_TWO}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MODE_ONE,
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 1 } },
      },
      {
        text: MODE_TWO,
        targets: distinctTargets(2, smallCreatureCard, { optional: true }),
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "put-onto-battlefield", target: 0 },
            { kind: "put-onto-battlefield", target: 1 },
          ],
        },
      },
    ],
  },
});
