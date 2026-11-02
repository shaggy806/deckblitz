import { defineCard } from "../define.js";

// Legends. EDHREC rank 29221. The two untap steps are counted on the creature,
// whoever controls it during each (the ruling): `doesntUntapSteps`.

export default defineCard({
  name: "Telekinesis",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap target creature. Prevent all combat damage that would be dealt by that creature this turn. It doesn't untap during its controller's next two untap steps.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true, doesntUntapSteps: 2 },
    ],
  },
});
