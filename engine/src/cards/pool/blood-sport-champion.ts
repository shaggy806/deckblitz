import { defineCard } from "../define.js";


export default defineCard({
  name: "Blood-Sport Champion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  kicker: { cost: "{2}" },
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nDeathtouch\nWhen this creature enters, if it was kicked, other creatures you control gain deathtouch until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "deathtouch",
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters, if it was kicked, other creatures you control gain deathtouch until end of turn.",
      condition: { kind: "self-kicked" },
    },
  ],
});
