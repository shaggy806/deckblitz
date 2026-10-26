import { defineCard } from "../define.js";

// EDHREC rank 24523. Morningtide.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it.";
const SHRINK_TEXT =
  "{1}{B}, Remove a +1/+1 counter from this creature: All other creatures get -1/-1 until end of turn.";

export default defineCard({
  name: "Festercreep",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${SHRINK_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: SHRINK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
});
