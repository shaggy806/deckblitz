import { defineCard } from "../define.js";

const UNTAP_TEXT = "{1}, Sacrifice another creature: Untap this creature. Activate only during your turn.";

export default defineCard({
  name: "Chained Brute",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 4,
  toughness: 3,
  text: `This creature doesn't untap during your untap step.\n${UNTAP_TEXT}`,
  static: [
    { affects: { scope: "self" }, doesntUntap: true, text: "This creature doesn't untap during your untap step." },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
