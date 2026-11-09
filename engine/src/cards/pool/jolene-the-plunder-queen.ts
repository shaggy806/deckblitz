import { defineCard } from "../define.js";

export default defineCard({
  name: "Jolene, the Plunder Queen",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Whenever a player attacks one or more of your opponents, that attacking player creates a Treasure token.\nIf you would create one or more Treasure tokens, instead create those tokens plus an additional Treasure token.\nSacrifice five Treasures: Put five +1/+1 counters on Jolene.",
  triggered: [
    {
      trigger: { on: "attack-with", who: "any", atLeast: 1, filter: { attackingOpponent: true } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, who: "active-player" },
      resolve: null,
      text: "Whenever a player attacks one or more of your opponents, that attacking player creates a Treasure token.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusOneToken: "Treasure Token", ofTokens: { subtypesAnyOf: ["Treasure"] } },
      text: "If you would create one or more Treasure tokens, instead create those tokens plus an additional Treasure token.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" }, count: 5 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 5 },
      resolve: null,
      text: "Sacrifice five Treasures: Put five +1/+1 counters on Jolene.",
    },
  ],
});
