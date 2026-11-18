import { defineCard } from "../define.js";

// "That player exiles a card from their hand face down": the damaged player
// picks it from their own hand, and it's linked to this creature (rule
// 607.2a). "You may look at cards exiled with this creature" lets this
// creature's controller — and whoever comes to control it — look, not the
// player who exiled it (406.3), and so play it (406.3b).

const TRIGGER_TEXT = "Whenever this creature deals combat damage to a player, that player exiles a card from their hand face down.";
const PLAY_TEXT =
  "You may look at cards exiled with this creature, and you may play lands and cast spells from among those cards.";

export default defineCard({
  name: "Kheru Mind-Eater",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${TRIGGER_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      resolve: null,
      text: TRIGGER_TEXT,
      targets: [],
      effect: {
        kind: "look-and-choose",
        player: "that-player",
        zone: "hand",
        min: 1,
        max: 1,
        destination: "exile-face-down",
        leftover: "stay",
        faceDownLooks: "source-controller",
      },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: PLAY_TEXT,
      mayPlay: { from: "exile", play: true, filter: {}, linked: true },
    },
  ],
});
