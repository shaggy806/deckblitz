import { defineCard } from "../define.js";

// EDHREC rank 17102.
const SPIRIT_TEXT =
  'Whenever another nontoken Spirit you control enters, create a 1/1 colorless Spirit creature token with "This token can\'t block or be blocked by non-Spirit creatures."';
const FLICKER_TEXT =
  "{3}{U}: Exile another target creature you control. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Baboon Spirit",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Monkey", "Spirit"],
  power: 2,
  toughness: 4,
  text: `${SPIRIT_TEXT}\n${FLICKER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, subtype: "Spirit" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless, Evasive)", count: 1 },
      resolve: null,
      text: SPIRIT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature" } } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: { step: "end" },
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
