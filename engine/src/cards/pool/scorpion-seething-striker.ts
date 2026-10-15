import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of your end step, if a creature died this turn, target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Scorpion, Seething Striker",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Scorpion", "Human", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: ["creature-you-control"],
      effect: { kind: "connive", target: 0 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
