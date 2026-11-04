import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// The intervening "if" counts Field itself and the land entering (the rulings),
// each name once (rule 201.2), as it triggers and again as it resolves (rule 603.4).
const TEXT =
  "Whenever this land or another land you control enters, if you control seven or more lands with different names, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Field of the Dead",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {C}.\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7, distinctNames: true, countsSelf: true },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: TEXT,
    }),
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
