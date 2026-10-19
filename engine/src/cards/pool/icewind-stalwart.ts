import { defineCard } from "../define.js";

// EDHREC rank 10831.
//
// Rulings:
//   [2022-06-10] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2022-06-10] When the card returns to the battlefield, it will be a new object with no
//     connection to the card that was exiled. Auras attached to the exiled creature will be put
//     into their owners' graveyards. Any Equipment will become unattached and remain on the
//     battlefield. Any counters on the exiled creature will cease to exist.

const TEXT =
  "Protection Fighting Style — When this creature enters, exile up to one target non-Warrior creature you control, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Icewind Stalwart",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Tiefling", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", whose: "you", filter: { type: "creature", notSubtypes: ["Warrior"] } },
        },
      ],
      effect: { kind: "flicker", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
