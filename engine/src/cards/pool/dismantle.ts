import { defineCard } from "../define.js";

// "That artifact" is read as it last existed on the battlefield (608.2h):
// every counter of every kind it had, whatever they were (the ruling). As it
// resolves you choose an artifact you control — not a target — and the kind
// of counter (the ruling), after the destruction. An indestructible artifact
// still on the battlefield counts too (the ruling); an illegal target and the
// spell does nothing (608.2b).
export default defineCard({
  name: "Dismantle",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact. If that artifact had counters on it, put that many +1/+1 counters or charge counters on an artifact you control.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { counters: { compare: { op: "gte", n: 1 } } } },
        then: {
          kind: "choose-permanents",
          filter: { type: "artifact", controlledBy: "you" },
          min: 1,
          upTo: 1,
          keepTargets: true,
          prompt: "Choose an artifact you control",
          then: {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "+1/+1 counters", effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { countersOn: 1 } } },
              { text: "Charge counters", effect: { kind: "add-counter", target: 0, counter: "charge", amount: { countersOn: 1 } } },
            ],
          },
        },
      },
    ],
  },
});
