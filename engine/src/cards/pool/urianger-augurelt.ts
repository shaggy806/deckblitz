import { defineCard } from "../define.js";

const LIFE_TEXT = "Whenever you play a land from exile or cast a spell from exile, you gain 2 life.";
const DRAW_TEXT = "Draw Arcanum — {T}: Look at the top card of your library. You may exile it face down.";
const PLAY_TEXT =
  "Play Arcanum — {T}: Until end of turn, you may play cards exiled with Urianger Augurelt. Spells you cast this way cost {2} less to cast.";

export default defineCard({
  name: "Urianger Augurelt",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 1,
  toughness: 3,
  text: `${LIFE_TEXT}\n${DRAW_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "plays-card", who: "you", from: "exile" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      // A hideaway's look: the card stays on top unless it's exiled, face
      // down and linked to Urianger, whose controller may look at it.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        destination: "exile-face-down",
        leftover: "stay",
        prompt: "You may exile it face down",
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, play: true, reduce: 2 } },
      resolve: null,
      text: PLAY_TEXT,
    },
  ],
});
