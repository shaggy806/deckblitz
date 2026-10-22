import { defineCard } from "../define.js";

// EDHREC rank 29926. "At end of combat" is the beginning of the next end of
// combat step — activated during one, the delayed ability waits for the
// next (the 2013-04-15 ruling).
const BOTH_TEXT =
  "{R}{R}, {T}: Target creature you control can't be blocked this turn. Destroy it and this creature at end of combat.";
const ONE_TEXT = "{R}{R}{R}{R}, {T}: Target creature you control can't be blocked this turn. Destroy it at end of combat.";

export default defineCard({
  name: "Goblin Sappers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: `${BOTH_TEXT}\n${ONE_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}{R}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
          {
            kind: "delayed-trigger",
            at: "end-of-combat",
            text: "Destroy that creature and Goblin Sappers.",
            effect: {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "destroy", target: 0 },
                { kind: "destroy", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: BOTH_TEXT,
    },
    {
      cost: { mana: "{R}{R}{R}{R}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
          {
            kind: "delayed-trigger",
            at: "end-of-combat",
            text: "Destroy that creature.",
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: ONE_TEXT,
    },
  ],
});
