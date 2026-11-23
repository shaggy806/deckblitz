import { defineCard } from "../define.js";

// Playtest card: Fog and one of Kibo, Uktabi Prince's Bananas.

export default defineCard({
  name: "Peel Out",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: 'Prevent all combat damage that would be dealt this turn. Create a colorless artifact token named Banana with "{T}, Sacrifice this token: Add {R} or {G}. You gain 2 life."',
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage" },
      { kind: "create-token", token: "Banana Token", count: 1 },
    ],
  },
});
