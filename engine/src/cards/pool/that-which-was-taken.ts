import { defineCard } from "../define.js";

const COUNTER = "{4}, {T}: Put a divinity counter on target permanent other than That Which Was Taken.";
const STATIC = "Each permanent with a divinity counter on it has indestructible.";

export default defineCard({
  name: "That Which Was Taken",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${COUNTER}\n${STATIC}`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [{ kind: "other", of: "permanent" }],
      effect: { kind: "add-counter", target: 0, counter: "divinity", amount: 1 },
      resolve: null,
      text: COUNTER,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { counters: { kind: "divinity", compare: { op: "gte", n: 1 } } } },
      grantKeywords: ["indestructible"],
      text: STATIC,
    },
  ],
});
