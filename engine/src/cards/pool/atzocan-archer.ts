import { defineCard } from "../define.js";

// EDHREC rank 21278. Ixalan. Another target creature — yours included (the
// ruling) — is chosen as the trigger goes on the stack; whether they fight is
// chosen as it resolves.
const TEXT = "When this creature enters, you may have it fight another target creature.";

export default defineCard({
  name: "Atzocan Archer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT} (Each deals damage equal to its power to the other.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Have Atzocan Archer fight the target creature?",
        effect: { kind: "fight", a: "source", b: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
