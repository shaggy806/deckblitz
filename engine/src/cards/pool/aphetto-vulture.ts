import { defineCard } from "../define.js";

const TEXT = "When this creature dies, you may put target Zombie card from your graveyard on top of your library.";

// The target is chosen once it's in the graveyard, so it can be itself (the
// ruling).
export default defineCard({
  name: "Aphetto Vulture",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Zombie" } } }],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
