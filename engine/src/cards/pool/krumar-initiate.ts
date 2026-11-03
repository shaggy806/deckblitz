import { defineCard } from "../define.js";

const TEXT =
  "{X}{B}, {T}, Pay X life: This creature endures X. Activate only as a sorcery. (Put X +1/+1 counters on it or create an X/X white Spirit creature token.)";
const SPIRIT = {
  kind: "create-token",
  token: "Spirit Token (Abzan Monument)",
  count: 1,
  basePt: { power: "x", toughness: "x" },
} as const;

export default defineCard({
  name: "Krumar Initiate",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{B}", tap: true, payLife: "x" },
      targets: [],
      sorcerySpeed: true,
      // No longer there, or unable to take counters, it just makes the Spirit
      // (the rulings).
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Put X +1/+1 counters on this creature.",
              effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
            },
            { text: "Create an X/X white Spirit creature token.", effect: SPIRIT },
          ],
        },
        else: SPIRIT,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
