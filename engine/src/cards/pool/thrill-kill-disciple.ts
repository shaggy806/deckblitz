import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

const DIES = "When this creature dies, create a Junk token.";

export default defineCard({
  name: "Thrill-Kill Disciple",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 2,
  kicker: {
    cost: "{1}",
    multi: true,
    keyword: "squad",
    also: { text: "{1}, Discard a card", discard: 1 },
  },
  text: `Squad—{1}, Discard a card. (As an additional cost to cast this spell, you may pay its squad cost any number of times. When this creature enters, create that many tokens that are copies of it.)\n${DIES}`,
  triggered: [
    squadTrigger(),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});
