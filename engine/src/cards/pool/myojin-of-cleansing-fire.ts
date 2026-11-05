import { defineCard } from "../define.js";

// A cast from the command zone isn't one from the hand (the ruling).

export default defineCard({
  name: "Myojin of Cleansing Fire",
  manaCost: "{5}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 6,
  text: "Myojin of Cleansing Fire enters with a divinity counter on it if you cast it from your hand.\nMyojin of Cleansing Fire has indestructible as long as it has a divinity counter on it.\nRemove a divinity counter from Myojin of Cleansing Fire: Destroy all other creatures.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "divinity", count: 1 } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true },
      resolve: null,
      text: "Remove a divinity counter from Myojin of Cleansing Fire: Destroy all other creatures.",
    },
  ],
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
      text: "Myojin of Cleansing Fire enters with a divinity counter on it if you cast it from your hand.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { counters: { kind: "divinity", compare: { op: "gte", n: 1 } } } },
      grantKeywords: ["indestructible"],
      text: "Myojin of Cleansing Fire has indestructible as long as it has a divinity counter on it.",
    },
  ],
});
