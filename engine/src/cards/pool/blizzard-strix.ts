import { defineCard } from "../define.js";

// EDHREC rank 16209.
//
// Rulings:
//   [2019-06-14] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2019-06-14] Auras attached to the exiled permanent will be put into their owners' graveyards.
//     Equipment attached to the exiled permanent will become unattached and remain on the
//     battlefield. Any counters on the exiled permanent will cease to exist. Once the exiled
//     permanent returns, it's considered a new object with no relation to the object that it was.
//   [2019-06-14] If Blizzard Strix enters the battlefield during a player's end step, the exiled
//     permanent will remain exiled until the next turn's end step.
// The intervening if (rule 603.4) is asked as it triggers and again as it
// resolves; Flickerwisp's delayed return.

const TEXT =
  "When this creature enters, if you control another snow permanent, exile target permanent other than this creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Blizzard Strix",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 1, excludeSelf: true },
      targets: [{ kind: "other", of: "permanent" }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
