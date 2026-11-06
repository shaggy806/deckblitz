import { defineCard } from "../define.js";

// EDHREC rank 29307.
// X is Picard's power as the ability resolves, as he last existed if he has
// left the battlefield.

const PUMP_TEXT =
  "{1}, {T}: Another target creature gets +X/+X until end of turn, where X is Picard's power. Activate only as a sorcery.";

export default defineCard({
  name: "Picard, Leading by Example",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 2,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      sorcerySpeed: true,
      text: PUMP_TEXT,
    },
  ],
});
