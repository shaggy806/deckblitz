import { defineCard } from "../define.js";

const ENTER_TEXT = "Myojin of Infinite Rage enters with a divinity counter on it if you cast it from your hand.";
const INDESTRUCTIBLE_TEXT = "Myojin of Infinite Rage has indestructible as long as it has a divinity counter on it.";
const DESTROY_TEXT = "Remove a divinity counter from Myojin of Infinite Rage: Destroy all lands.";

export default defineCard({
  name: "Myojin of Infinite Rage",
  manaCost: "{7}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 7,
  toughness: 4,
  text: `${ENTER_TEXT}\n${INDESTRUCTIBLE_TEXT}\n${DESTROY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "divinity",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "divinity", compare: { op: "gte", n: 1 } } } },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "divinity", count: 1 } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "land" } },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
