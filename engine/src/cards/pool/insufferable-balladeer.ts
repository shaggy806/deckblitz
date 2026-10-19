import { defineCard } from "../define.js";

const MOCKERY_TEXT =
  "Vicious Mockery — When this creature enters, target creature an opponent controls can't block this turn. Goad it.";

export default defineCard({
  name: "Insufferable Balladeer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 2,
  toughness: 1,
  text: `${MOCKERY_TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          { kind: "goad", target: 0 },
        ],
      },
      resolve: null,
      text: MOCKERY_TEXT,
    },
  ],
});
