import { defineCard } from "../define.js";

// EDHREC rank 6951.
//
// Rulings:
//   [2019-01-25] The creature returns untapped unless another effect causes it to enter the
//     battlefield tapped.
//   [2019-01-25] If a token is exiled this way, it will cease to exist and won’t return to the
//     battlefield.
//   [2019-01-25] The returned card won’t be the target of any spells or abilities that targeted it
//     before. Spells that don’t target, such as Kaya’s Wrath, may still affect it.
//   [2019-01-25] Once the exiled creature returns, it’s considered a new object with no relation
//     to the object that it was. Auras attached to the exiled creature will be put into their
//     owners’ graveyards. Equipment attached to the exiled creature will become unattached and
//     remain on the battlefield. Any counters on the exiled creature will cease to exist.
//
// Blur's flicker; "it" is the card that came back, a new object the spell
// doesn't target (the ruling), so the first strike goes to what this
// resolution put onto the battlefield (`thisWay` — Storm of Souls' shape). A
// token that was exiled never returns, and nothing gains first strike.
const TEXT =
  "Exile target creature you control, then return that card to the battlefield under its owner's control. It gains first strike until end of turn.";

export default defineCard({
  name: "Justiciar's Portal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "flicker", target: 0 },
      {
        kind: "grant-keyword-all",
        filter: { thisWay: "put-onto-battlefield" },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
    ],
  },
});
