import { defineCard } from "../define.js";

// EDHREC rank 24218.

const PUMP_TEXT = "{B}, Tap another untapped creature you control: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Black Oak of Odunos",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Treefolk"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender\n${PUMP_TEXT}`,
  activated: [
    {
      // A creature that's summoning sick may be tapped for it (ruling): no {T} symbol.
      cost: { mana: "{B}", tap: false, tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
