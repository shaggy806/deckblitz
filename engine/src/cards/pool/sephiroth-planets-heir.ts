import { defineCard } from "../define.js";

export default defineCard({
  name: "Sephiroth, Planet's Heir",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nWhen Sephiroth enters, creatures your opponents control get -2/-2 until end of turn.\nWhenever a creature an opponent controls dies, put a +1/+1 counter on Sephiroth.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When Sephiroth enters, creatures your opponents control get -2/-2 until end of turn.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature an opponent controls dies, put a +1/+1 counter on Sephiroth.",
    },
  ],
});
