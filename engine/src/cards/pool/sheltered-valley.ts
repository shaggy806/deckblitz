import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const INSTEAD =
  "If this land would enter, instead sacrifice each other permanent named Sheltered Valley you control, then put " +
  "this land onto the battlefield.";
const UPKEEP = "At the beginning of your upkeep, if you control three or fewer lands, you gain 1 life.";

export default defineCard({
  name: "Sheltered Valley",
  types: ["land"],
  text: `${INSTEAD}\n${UPKEEP}\n{T}: Add {C}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { name: "Sheltered Valley" }, count: "all" } },
      },
      text: INSTEAD,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: UPKEEP,
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 4 } },
    },
  ],
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
});
