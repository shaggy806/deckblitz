import { defineCard } from "../define.js";

// EDHREC rank 26514.
//
// Rulings:
//   [2011-01-01] You may target a tapped artifact with Rust Tick’s activated ability.
//   [2011-01-01] If Rust Tick untaps or leaves the battlefield, its effect will end. This has no
//     immediate visible effect on the affected artifact. (It doesn’t untap immediately, for
//     example.) The artifact will just untap as normal during its controller’s next untap step.
//   [2011-01-01] If the affected artifact is untapped by some other spell or ability, Rust Tick’s
//     effect will not end. If you keep Rust Tick tapped, and that artifact becomes tapped again,
//     Rust Tick will continue to prevent it from being untapped during its controller’s untap
//     step.
//   [2011-01-01] If you control both Rust Tick and the affected artifact, that artifact won’t
//     untap during the untap step in which you choose to untap Rust Tick. (It will untap during
//     your next one.)
//   [2011-01-01] Rust Tick doesn’t track the artifact’s controller. If the affected artifact
//     changes controllers, Rust Tick will prevent it from being untapped during its new
//     controller’s untap step.

export default defineCard({
  name: "Rust Tick",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 3,
  text: "You may choose not to untap this creature during your untap step.\n{1}, {T}: Tap target artifact. It doesn't untap during its controller's untap step for as long as this creature remains tapped.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["artifact"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: "{1}, {T}: Tap target artifact. It doesn't untap during its controller's untap step for as long as this creature remains tapped.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this creature during your untap step.",
    },
  ],
});
