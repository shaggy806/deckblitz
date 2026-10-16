import { defineCard } from "../define.js";

// EDHREC rank 22319. Threats Around Every Corner's manifest dread, on a dies
// trigger.
const DIES_TEXT = "When this creature dies, manifest dread.";

export default defineCard({
  name: "Bashful Beastie",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 4,
  text: `${DIES_TEXT} (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
