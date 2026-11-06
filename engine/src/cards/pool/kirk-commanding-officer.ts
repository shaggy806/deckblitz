import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever you attack while creatures you control have total power 8 or greater, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Kirk, Commanding Officer",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n{2}, Sacrifice Kirk: Destroy target artifact or enchantment.`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}, Sacrifice Kirk: Destroy target artifact or enchantment.",
    },
  ],
  triggered: [
    {
      // Tactical Officer's shape: "while" is part of the trigger condition.
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      whileCondition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
