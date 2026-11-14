import { defineCard } from "../define.js";

// The second slot's power is at most the first's (`compares`), checked as the
// targets are chosen, the pair together (rule 601.2c), and again as it
// resolves (608.2b): if either target is illegal then, the exchange doesn't
// happen.
const TEXT =
  "When this creature enters, you may exchange control of target creature you control and target creature with power less than or equal to that creature's power an opponent controls.";

export default defineCard({
  name: "Spawnbroker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "you", filter: { type: "creature" } },
        {
          kind: "other",
          of: { kind: "permanent", whose: "opponent", filter: { type: "creature" } },
          than: { slot: 0 },
          compares: { stat: "power", op: "lte" },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exchange control of the two target creatures?",
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
