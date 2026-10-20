import { defineCard } from "../define.js";

const VENTURE_TEXT =
  "{3}, {T}, Tap another untapped creature you control: Venture into the dungeon. Activate only as a sorcery.";

export default defineCard({
  name: "Ranger's Hawk",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${VENTURE_TEXT} (Enter the first room or advance to the next room.)`,
  activated: [
    {
      cost: {
        mana: "{3}",
        tap: true,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
