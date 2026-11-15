import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 27247.

const TEXT =
  "Strange new worlds — {6}, {T}: You may put a creature or Spacecraft card from your hand onto the battlefield. It enters with X additional +1/+1 counters on it if it's a creature and X additional charge counters on it if it's a Spacecraft, where X is the number of differently named lands you control.";

// X is read as the ability resolves; "if it's a creature / a Spacecraft" is
// judged as it would be on the battlefield (rule 614.12), so a Spacecraft
// that's an artifact creature gets both.
const X: EffectAmount = { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } };

export default defineCard({
  name: "Chief Montgomery Scott",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] },
        withCounters: [
          { kind: "+1/+1", amount: X, ifType: "creature" },
          { kind: "charge", amount: X, ifSubtype: "Spacecraft" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
