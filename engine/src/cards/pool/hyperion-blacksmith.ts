import { defineCard } from "../define.js";

// Legends. EDHREC rank 31937.
//
// Rulings:
//   [2004-10-04] You decide whether you are tapping or untapping the artifact on resolution.
//
// Gandalf the Grey's "you may tap or untap": an unannounced `modal` of none
// or one, chosen as the ability resolves.

export default defineCard({
  name: "Hyperion Blacksmith",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "{T}: You may tap or untap target artifact an opponent controls.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["artifact-an-opponent-controls"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: "{T}: You may tap or untap target artifact an opponent controls.",
    },
  ],
});
