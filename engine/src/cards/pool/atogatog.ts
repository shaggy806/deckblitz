import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 19482. Dina, Soul Steeper's sacrificed-power
// pump, on both halves. Atogatog is an Atog itself, so it may be the one
// sacrificed (nothing says "another").

const TEXT =
  "Sacrifice an Atog creature: Atogatog gets +X/+X until end of turn, where X is the sacrificed creature's power.";

export default defineCard({
  name: "Atogatog",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 5,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: { filter: { type: "creature", subtype: "Atog", controlledBy: "you" } },
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "sacrificed" },
        toughness: { powerOf: "sacrificed" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
