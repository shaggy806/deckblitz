import { defineCard } from "../define.js";

// Rulings:
//   The value of X is calculated only once, as the ability resolves (this
//   creature's power then, or as it last existed on the battlefield).

const TEXT =
  "Whenever this creature becomes tapped, another target creature you control gets +X/+X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Hemosymbic Mite",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mite"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
