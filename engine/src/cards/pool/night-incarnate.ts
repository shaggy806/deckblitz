import { defineCard } from "../define.js";

// EDHREC rank 16190.

export default defineCard({
  name: "Night Incarnate",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["deathtouch"],
  evoke: { cost: "{3}{B}" },
  text: "Deathtouch\nWhen this creature leaves the battlefield, all creatures get -3/-3 until end of turn.\nEvoke {3}{B} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -3,
        toughness: -3,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature leaves the battlefield, all creatures get -3/-3 until end of turn.",
    },
  ],
});
