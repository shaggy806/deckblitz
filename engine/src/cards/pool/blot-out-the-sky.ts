import { defineCard } from "../define.js";

export default defineCard({
  name: "Blot Out the Sky",
  manaCost: "{X}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Create X tapped 2/1 white and black Inkling creature tokens with flying. If X is 6 or more, destroy all noncreature, nonland permanents.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Inkling Token", count: "x", tapped: true },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 6 } },
        then: { kind: "destroy-all", filter: { notTypes: ["creature", "land"] } },
      },
    ],
  },
});
