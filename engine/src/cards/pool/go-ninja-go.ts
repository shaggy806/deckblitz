import { defineCard } from "../define.js";

// EDHREC rank 16914.
//
// Rulings:
//   [2026-01-27] Once the exiled creature returns, it's considered a new object with no relation
//     to the object that it was. Auras attached to the exiled creature will be put into their
//     owners' graveyards. Equipment attached to the exiled creature will become unattached and
//     remain on the battlefield. Any counters on the exiled creature will cease to exist.
//   [2026-01-27] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.


const FLICKER_TEXT =
  "Exile target creature you control, then return it to the battlefield under its owner's control.";
const DAMAGE_TEXT =
  "Go Ninja Go deals damage equal to the greatest power among creatures you control to target creature an opponent controls.";

// Winterflame's "one or both", each mode with its own target. The modes
// resolve in printed order, so a creature blinked by the first is back (a new
// object, its counters gone) when the second reads the greatest power, which
// it does as it deals the damage.
export default defineCard({
  name: "Go Ninja Go",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: `Choose one or both —\n• ${FLICKER_TEXT}\n• ${DAMAGE_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      { text: FLICKER_TEXT, targets: ["creature-you-control"], effect: { kind: "flicker", target: 0 } },
      {
        text: DAMAGE_TEXT,
        targets: ["creature-an-opponent-controls"],
        effect: {
          kind: "damage",
          target: 0,
          amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
        },
      },
    ],
  },
});
