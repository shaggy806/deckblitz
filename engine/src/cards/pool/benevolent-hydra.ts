import { defineCard } from "../define.js";

// EDHREC rank 2938.
//
// Rulings:
//   [2022-12-02] "Put on another creature you control" includes creatures other than Benevolent
//     Hydra that enter the battlefield with +1/+1 counters on them. If another creature would
//     enter the battlefield with a number of +1/+1 counters on it while you control Benevolent
//     Hydra, it enters with that many counters plus one.
//   [2022-12-02] Each additional Benevolent Hydra you control will increase the number of +1/+1
//     counters placed on anther creature by one.

export default defineCard({
  name: "Benevolent Hydra",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 1,
  toughness: 1,
  text: "This creature enters with X +1/+1 counters on it.\nIf one or more +1/+1 counters would be put on another creature you control, that many plus one +1/+1 counters are put on it instead.\n{T}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on another target creature you control.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{T}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on another target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { type: "creature" }, other: true },
      text: "If one or more +1/+1 counters would be put on another creature you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
