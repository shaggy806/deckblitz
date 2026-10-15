import { defineCard } from "../define.js";

const ALONE_TEXT =
  "Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Agents of S.H.I.E.L.D.",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 4,
  text: ALONE_TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
