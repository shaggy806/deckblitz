import { defineCard } from "../define.js";

// EDHREC rank 13226. The target is chosen as the trigger goes on the stack;
// whether to return it, as it resolves.
const TEXT = "When this creature enters, you may return target Aura or Equipment card from your graveyard to your hand.";

export default defineCard({
  name: "Ironclad Slayer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } }],
      effect: {
        kind: "may",
        prompt: "Return the target Aura or Equipment card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
