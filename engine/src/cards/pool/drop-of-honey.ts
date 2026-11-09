import { defineCard } from "../define.js";

// Not targeted (the ruling). An indestructible creature tied for least power
// can't be the one chosen: you must destroy one without it if you can, and if
// every creature with the least power has it, nothing is destroyed (the ruling).
const UPKEEP =
  "At the beginning of your upkeep, destroy the creature with the least power. It can't be regenerated. If two or more creatures are tied for least power, you choose one of them.";
const LEAVE = "When there are no creatures on the battlefield, sacrifice this enchantment.";

export default defineCard({
  name: "Drop of Honey",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${LEAVE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: {
          type: "creature",
          notKeyword: "indestructible",
          greatestInZone: { of: "power", among: { type: "creature" }, least: true },
        },
        upTo: 1,
        min: 1,
        then: { kind: "destroy", target: 0, cantBeRegenerated: true },
        prompt: "Choose a creature with the least power to destroy",
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: {
        on: "state",
        state: {
          kind: "all",
          of: [
            { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
            { kind: "not", of: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 } },
          ],
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: LEAVE,
    },
  ],
});
