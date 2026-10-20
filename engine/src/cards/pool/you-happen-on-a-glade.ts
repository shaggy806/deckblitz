import { defineCard } from "../define.js";

const JOURNEY_TEXT =
  "Journey On — Search your library for up to two basic land cards, reveal them, put them into your hand, then shuffle.";
const CAMP_TEXT = "Make Camp — Return target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "You Happen On a Glade",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${JOURNEY_TEXT}\n• ${CAMP_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: JOURNEY_TEXT,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 2,
        },
      },
      {
        text: CAMP_TEXT,
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
