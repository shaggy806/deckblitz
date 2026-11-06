import { defineCard } from "../define.js";


export default defineCard({
  name: "Imperial Hullbreachers",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)\nFlying\nBattle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true },
      resolve: null,
      text: "When this creature enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Battle cry",
    },
  ],
});
