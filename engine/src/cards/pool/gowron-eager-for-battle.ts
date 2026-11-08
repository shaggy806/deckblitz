import { defineCard } from "../define.js";

const DIES = "Whenever another creature dies, put a +1/+1 counter on Gowron.";
const SAC =
  "Sacrifice another creature: Gowron gains trample until end of turn. If you sacrificed a Klingon this way, you draw a card and lose 1 life.";

export default defineCard({
  name: "Gowron, Eager for Battle",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${DIES}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "object-matches", object: { paid: "sacrificed" }, filter: { subtype: "Klingon" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "lose-life", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
});
