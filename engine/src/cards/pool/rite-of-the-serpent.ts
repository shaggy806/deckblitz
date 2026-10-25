import { defineCard } from "../define.js";

// EDHREC rank 29721. "Had a +1/+1 counter" reads the creature as it last
// existed on the battlefield (a `target` condition), or as it is if it
// survived (indestructible, regenerated — the ruling); one Snake however many
// counters, whoever controlled it.

export default defineCard({
  name: "Rite of the Serpent",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. If that creature had a +1/+1 counter on it, create a 1/1 green Snake creature token.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
        then: { kind: "create-token", token: "Snake Token", count: 1 },
      },
    ],
  },
});
