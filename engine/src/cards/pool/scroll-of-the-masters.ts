import { defineCard } from "../define.js";

// The lore counters are counted as the ability resolves — as the artifact
// last existed if it has left (the ruling; `countersOn` reads last-known
// information) — and the bonus is fixed from then on.

const PUMP = "{3}, {T}: Target creature you control gets +1/+1 until end of turn for each lore counter on this artifact.";

export default defineCard({
  name: "Scroll of the Masters",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `Whenever you cast a noncreature spell, put a lore counter on this artifact.\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { countersOn: "source", counter: "lore" },
        toughness: { countersOn: "source", counter: "lore" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "lore", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put a lore counter on this artifact.",
    },
  ],
});
