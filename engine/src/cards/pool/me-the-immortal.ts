import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 15522.
//
// Rulings:
//   The counters that remain on Me as it changes zones aren't "put" on that card. Effects like
//     Doubling Season's won't affect those counters.
//   If a card becomes a copy of Me, counters will remain on that card as the copy leaves the
//     battlefield (unless it goes to your hand or library). Once it does so, it stops being a copy
//     of Me, so those counters will cease to exist when that card next changes zones.
//   Me's second ability only works if it has that ability in the zone it's moving from.
//   You must follow all normal timing rules when casting Me from your graveyard using Me's last
//     ability.
//   Me, the Immortal retains all counters, not just those granted by the first ability.
//   Counters that adjust power and/or toughness affect Me's power and/or toughness in zones other
//     than the battlefield. For example, a Me in the command zone with a +1/+1 counter on it will
//     be 4/4.
//
// Skullbriar's `countersPersistAcrossZones` (moveObject keeps the counters,
// not putting them again) and Rona's graveyard cast with two cards discarded;
// a P/T counter counts in every zone (layer 7c reads them wherever it is).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, put your choice of a +1/+1, first strike, vigilance, or menace counter on Me.";
const REMAIN_TEXT = "Counters remain on Me as it moves to any zone other than a player's hand or library.";
const CAST_TEXT =
  "You may cast this card from your graveyard by discarding two cards in addition to paying its other costs.";

const counter = (text: string, kind: string): { text: string; effect: EffectSpec } => ({
  text,
  effect: { kind: "add-counter", target: "source", counter: kind, amount: 1 },
});

export default defineCard({
  name: "Me, the Immortal",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  countersPersistAcrossZones: true,
  mayPlaySelf: { from: ["graveyard"], discard: 2 },
  text: `${COMBAT_TEXT}\n${REMAIN_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          counter("A +1/+1 counter", "+1/+1"),
          counter("A first strike counter", "first-strike"),
          counter("A vigilance counter", "vigilance"),
          counter("A menace counter", "menace"),
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
