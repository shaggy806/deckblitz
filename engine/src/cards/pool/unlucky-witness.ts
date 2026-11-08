import { defineCard } from "../define.js";

// EDHREC rank 18655. "One of those cards": one play shared between the two
// (`impulse-exile`'s `upTo`) — once one is played, the other may not be.

const DIES_TEXT =
  "When this creature dies, exile the top two cards of your library. Until your next end step, you may play one of those cards.";

export default defineCard({
  name: "Unlucky Witness",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 1,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "until-your-next-end-step", play: true, upTo: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
