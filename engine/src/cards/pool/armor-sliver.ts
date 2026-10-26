import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 25571. Every Sliver creature — any player's —
// gets the ability; "this creature" is the Sliver it's granted to (the
// ability's source), so several Armor Slivers stack (the 2013-07-01 ruling).

const GRANTED = "{2}: This creature gets +0/+1 until end of turn.";

export default defineCard({
  name: "Armor Sliver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `All Sliver creatures have "${GRANTED}"`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `All Sliver creatures have "${GRANTED}"`,
    },
  ],
});
