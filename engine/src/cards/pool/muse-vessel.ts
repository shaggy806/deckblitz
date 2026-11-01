import { defineCard } from "../define.js";

// The player the first ability targets picks the card, face up, and it's linked
// to this artifact (rule 607.2a). The second ability's choice is made as it
// resolves; a land played this way is a land play, a spell cast at its normal
// timing.
const EXILE = "{3}, {T}: Target player exiles a card from their hand. Activate only as a sorcery.";
const PLAY = "{1}: Choose a card exiled with this artifact. You may play that card this turn.";

export default defineCard({
  name: "Muse Vessel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE}\n${PLAY}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      sorcerySpeed: true,
      targets: ["player"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          leftover: "stay",
        },
      },
      resolve: null,
      text: EXILE,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "choose-exiled-to-play", linked: true },
      resolve: null,
      text: PLAY,
    },
  ],
});
