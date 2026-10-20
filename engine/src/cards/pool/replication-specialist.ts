import { defineCard } from "../define.js";

// EDHREC rank 13576.
//
// Mirrorworks's shape without its "another": the copy is read off the artifact
// as it last existed if it has left by the time the ability resolves.
const TEXT =
  "Whenever a nontoken artifact you control enters, you may pay {1}{U}. If you do, create a token that's a copy of that artifact.";

export default defineCard({
  name: "Replication Specialist",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Artificer"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: false, type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} to create a token that's a copy of that artifact?",
        cost: "{1}{U}",
        effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
