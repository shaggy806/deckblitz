import { defineCard } from "../define.js";

// EDHREC rank 19120.
//
// Exalted's trigger (Akrasan Squire), its bonus a live count of the Kithkin
// you control read once, as the ability resolves (the ruling).

const ALONE_TEXT =
  "Whenever a creature you control attacks alone, it gets +X/+X until end of turn, where X is the number of Kithkin you control.";

const KITHKIN = { countOf: { subtype: "Kithkin", controlledBy: "you" } } as const;

export default defineCard({
  name: "Thoughtweft Imbuer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Advisor"],
  power: 0,
  toughness: 5,
  text: ALONE_TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: KITHKIN, toughness: KITHKIN, duration: "end-of-turn" },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
