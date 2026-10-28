import { defineCard } from "../define.js";

// EDHREC rank 3520. Saruman, the White Hand's trigger with incubate.

const TEXT =
  "Whenever you cast a noncreature spell, incubate X, where X is that spell's mana value. (Create an Incubator token with X +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)";

export default defineCard({
  name: "Chrome Host Seedshark",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Shark"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "incubate", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
