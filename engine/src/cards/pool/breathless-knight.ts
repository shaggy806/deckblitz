import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature or another creature you control enters, if that creature entered from a graveyard or you cast it from a graveyard, put a +1/+1 counter on this creature.";

// One trigger per creature (not batched, unlike Kotis). A permanent spell cast
// from a graveyard enters from the stack, so it's the cast that counts for it
// (`castFrom`), and only your cast (`castBy`).
export default defineCard({
  name: "Breathless Knight",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: {
          type: "creature",
          anyOf: [{ enteredFrom: "graveyard" }, { castFrom: "graveyard", castBy: "you" }],
        },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
