import { defineCard } from "../define.js";

// EDHREC rank 21537.
//
// An illegal target as it resolves means the spell doesn't resolve at all:
// no incubating (the ruling, rule 608.2b).

export default defineCard({
  name: "Merciless Repurposing",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature. Incubate 3. (Create an Incubator token with three +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "exile", target: 0 }, { kind: "incubate", amount: 3 }],
  },
});
