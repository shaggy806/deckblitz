import { defineCard } from "../define.js";

// EDHREC rank 28323.
//
// X is that creature's power as the ability resolves — as it last existed on
// the battlefield if it has left by then.
const ENTER_TEXT =
  "Whenever another creature you control enters, Arni gets +X/+0 until end of turn, where X is that creature's power.";

export default defineCard({
  name: "Arni, Renowned Champion",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 1,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "trigger-object" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
