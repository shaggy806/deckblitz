import { defineCard } from "../define.js";

const TEXT = "Unblocked attacking Ninjas you control have lifelink.";

export default defineCard({
  name: "Throatseeker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Ninja"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      // `unblocked` holds only from the declare blockers step on (rule 509.1h).
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Ninja", controlledBy: "you", attacking: true, unblocked: true },
      },
      grantKeywords: ["lifelink"],
      text: TEXT,
    },
  ],
});
