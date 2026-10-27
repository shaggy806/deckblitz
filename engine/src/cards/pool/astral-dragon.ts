import { defineCard } from "../define.js";

export default defineCard({
  name: "Astral Dragon",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nProject Image — When this creature enters, create two tokens that are copies of target noncreature permanent, except they're 3/3 Dragon creatures in addition to their other types, and they have flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
      // An Aura copied this way is a creature, which can enchant nothing
      // (rule 303.4d), so it doesn't enter (303.4g): no tokens (the ruling).
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 2,
        who: "you",
        exceptions: { addTypes: ["creature"], addSubtypes: ["Dragon"], basePt: [3, 3], keywords: ["flying"] },
      },
      resolve: null,
      text: "Project Image — When this creature enters, create two tokens that are copies of target noncreature permanent, except they're 3/3 Dragon creatures in addition to their other types, and they have flying.",
    },
  ],
});
