import { defineCard } from "../define.js";

// Apocalypse (APC). "Exile it" is the card the dies trigger is about (nothing
// if it has left the graveyard); "each other player" is each opponent of the
// trigger's controller — every other player at a free-for-all table.
const TEXT =
  "When this creature dies, exile it and each other player creates a 3/3 black Angel creature token with flying.";

export default defineCard({
  name: "Haunted Angel",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "create-token", token: "Angel Token (black 3/3 flying)", count: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
