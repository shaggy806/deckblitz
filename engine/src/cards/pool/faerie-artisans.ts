import { defineCard } from "../define.js";

// Each Artisans's tokens remember it, so two of them each exile only their own
// (the ruling); "other" spares the one just made.

const TEXT =
  "Whenever a nontoken creature an opponent controls enters, create a token that's a copy of that creature except it's an artifact in addition to its other types. Then exile all other tokens created with this creature.";

export default defineCard({
  name: "Faerie Artisans",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { token: false, type: "creature", controlledBy: "opponent" },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token-copy",
            of: "trigger-object",
            count: 1,
            who: "you",
            exceptions: { addTypes: ["artifact"] },
            linkedToSource: true,
          },
          {
            kind: "exile-all",
            filter: { token: true, createdWithSource: true, notThisWay: "created" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
