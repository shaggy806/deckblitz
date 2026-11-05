import { defineCard } from "../define.js";

const DESTROY = "Destroy target nonland permanent.";
const RETURN = "Return target nonland permanent card from your graveyard to the battlefield.";

export default defineCard({
  name: "Moment of Reckoning",
  manaCost: "{3}{W}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: `Choose up to four. You may choose the same mode more than once.\n• ${DESTROY}\n• ${RETURN}`,
  targets: [],
  castModal: {
    minModes: 0,
    maxModes: 4,
    repeatModes: true,
    modes: [
      {
        text: DESTROY,
        targets: ["nonland-permanent"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: RETURN,
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["land", "instant", "sorcery"] } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
    ],
  },
});
