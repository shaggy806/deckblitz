import { defineCard } from "../define.js";

// EDHREC rank 16052.

export default defineCard({
  name: "Giltspire Avenger",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{T}: Destroy target creature that dealt damage to you this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", dealtDamageThisTurn: { to: "you" } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target creature that dealt damage to you this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exalted",
    },
  ],
});
