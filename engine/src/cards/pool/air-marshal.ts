import { defineCard } from "../define.js";

// EDHREC rank 28691. "Target Soldier": any player's.
const TEXT = "{3}: Target Soldier gains flying until end of turn.";

export default defineCard({
  name: "Air Marshal",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Soldier" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
