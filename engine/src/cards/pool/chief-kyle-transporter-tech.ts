import { defineCard } from "../define.js";

const TEXT =
  "Landfall — Whenever a land you control enters, exile up to one other target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Chief Kyle, Transporter Tech",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: { step: "end" },
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
