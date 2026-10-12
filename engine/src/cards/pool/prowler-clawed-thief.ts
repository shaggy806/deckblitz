import { defineCard } from "../define.js";

export default defineCard({
  name: "Prowler, Clawed Thief",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever another Villain you control enters, Prowler connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Villain" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever another Villain you control enters, Prowler connives.",
    },
  ],
});
