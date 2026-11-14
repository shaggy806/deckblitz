import { defineCard } from "../define.js";

// EDHREC rank 29320. Banding is the engine keyword (rule 702.22); the pump is
// Dragon Whelp's, word for word.
const PUMP_TEXT =
  "{R}: This creature gets +1/+0 until end of turn. If this ability has been activated four or more times this turn, sacrifice this creature at the beginning of the next end step.";

export default defineCard({
  name: "Nalathni Dragon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "banding"],
  text: `Flying; banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "activated-this-turn", atLeast: 4 },
            then: {
              kind: "delayed-trigger",
              at: { step: "end" },
              effect: { kind: "sacrifice-source" },
              text: "Sacrifice Nalathni Dragon.",
            },
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
