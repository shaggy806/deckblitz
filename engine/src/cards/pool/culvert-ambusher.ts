import { defineCard } from "../define.js";

const TEXT = "When this creature enters or is turned face up, target creature blocks this turn if able.";
const DISGUISE =
  "Disguise {4}{G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const BLOCKS = { kind: "block-if-able", target: 0 } as const;

export default defineCard({
  name: "Culvert Ambusher",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm", "Horror"],
  power: 4,
  toughness: 5,
  text: `${TEXT}\n${DISGUISE}`,
  morph: { keyword: "disguise", cost: "{4}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: BLOCKS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: BLOCKS,
      resolve: null,
      text: TEXT,
    },
  ],
});
