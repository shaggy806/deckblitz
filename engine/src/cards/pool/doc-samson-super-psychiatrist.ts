import { defineCard } from "../define.js";

const COUNTERS = "If you would put one or more counters on a permanent you control, put that many plus one of each of those kinds of counters on that permanent instead.";
const MANA = "{T}: Add X mana of any one color, where X is Doc Samson's power.";

export default defineCard({
  name: "Doc Samson, Super Psychiatrist",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Gamma", "Doctor", "Hero"],
  power: 3,
  toughness: 6,
  text: `${COUNTERS}\n${MANA}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", whoPuts: "you", filter: { controlledBy: "you" }, instead: { modify: { plus: 1 } } },
      text: COUNTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { powerOf: "source" } },
      resolve: null,
      text: MANA,
    },
  ],
});
