import { defineCard } from "../define.js";

const WARD_TEXT =
  "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)";
const FLY_TEXT =
  "This creature has flying as long as it's modified. (Equipment, Auras you control, and counters are modifications.)";

export default defineCard({
  name: "Skyward Spider",
  manaCost: "{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 2,
  text: `${WARD_TEXT}\n${FLY_TEXT}`,
  static: [
    {
      // Rule 700.9: any counter, any Equipment, an Aura its controller
      // controls (the rulings) — the `modified` filter.
      affects: { scope: "self" },
      condition: { kind: "source", filter: { modified: true } },
      grantKeywords: ["flying"],
      text: FLY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
});
