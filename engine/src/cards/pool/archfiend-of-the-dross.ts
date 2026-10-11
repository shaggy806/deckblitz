import { defineCard } from "../define.js";

// EDHREC rank 6810.
//
// Rulings:
//   If Archfiend of the Dross is no longer on the battlefield as its upkeep triggered ability
//     resolves, use the number of oil counters it had the last time it existed on the
//     battlefield to determine whether you lose the game. You can't remove oil counters from it
//     if it's not on the battlefield, so you won't lose the game if it had only one oil counter
//     on it before leaving the battlefield.
//   If Archfiend of the Dross somehow loses all of its oil counters due to an effect other than
//     its upkeep triggered ability, this won't cause you to lose the game until the next time
//     that ability resolves.
//
// Thing in the Ice's remove-then-check. `self-counters` reads last-known
// information once the Archfiend has left (the first ruling), and the check
// isn't gated on a counter having come off (the second). "Its controller" is
// the dead creature's last controller — Massacre Wurm's `trigger-controller`.

const OIL = "This creature enters with four oil counters on it.";
const UPKEEP =
  "At the beginning of your upkeep, remove an oil counter from this creature. Then if it has no oil counters on it, you lose the game.";
const DRAIN = "Whenever a creature an opponent controls dies, its controller loses 2 life.";

export default defineCard({
  name: "Archfiend of the Dross",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${OIL}\n${UPKEEP}\n${DRAIN}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 4 } },
      text: OIL,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "oil", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "oil", compare: { op: "eq", n: 0 } },
            then: { kind: "lose-game" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: DRAIN,
    },
  ],
});
