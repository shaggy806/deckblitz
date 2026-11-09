import { defineCard } from "../define.js";

const PHASE_OUT =
  "Whenever King of the Oathbreakers or another Spirit you control becomes the target of a spell, it phases out. (Treat it and anything attached to it as though they don't exist until your next turn.)";
const PHASE_IN =
  "Whenever King of the Oathbreakers or another Spirit you control phases in, create a tapped 1/1 white Spirit creature token with flying.";

const KING_OR_SPIRIT = { anyOf: [{ isSource: true }, { subtype: "Spirit" }] };

// EDHREC rank 12158.
export default defineCard({
  name: "King of the Oathbreakers",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Noble"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PHASE_OUT}\n${PHASE_IN}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", filter: KING_OR_SPIRIT, spellOnly: true },
      targets: [],
      effect: { kind: "phase-out", target: "trigger-object" },
      resolve: null,
      text: PHASE_OUT,
    },
    {
      trigger: { on: "event", event: "phases-in", who: "you-control", filter: KING_OR_SPIRIT },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1, tapped: true },
      resolve: null,
      text: PHASE_IN,
    },
  ],
});
