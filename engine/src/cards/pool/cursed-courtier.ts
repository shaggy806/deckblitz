import { defineCard } from "../define.js";

const COURTIER_TEXT = "When this creature enters, create a Cursed Role token attached to it.";

// "It" is this creature, as it is when the trigger resolves: gone by then (or
// back as a new object), there's nothing to attach to and no Role is made.
export default defineCard({
  name: "Cursed Courtier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${COURTIER_TEXT} (Enchanted creature is 1/1.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: "source" },
      resolve: null,
      text: COURTIER_TEXT,
    },
  ],
});
