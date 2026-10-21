import { defineCard } from "../define.js";

// EDHREC rank 30981. Watcher of the Spheres without "another": the Shaman
// counts itself if it enters with flying.

const TEXT = "Whenever a creature you control with flying enters, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Waterkin Shaman",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", keyword: "flying" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
