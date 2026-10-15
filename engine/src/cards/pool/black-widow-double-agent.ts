import { defineCard } from "../define.js";

// EDHREC rank 18874.
//
// Widow's Walk's shape: the lone attacker is the trigger object.
const TEXT = "Whenever a creature you control attacks alone, it gains first strike and menace until end of turn.";

export default defineCard({
  name: "Black Widow, Double Agent",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero", "Villain"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "trigger-object", keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
