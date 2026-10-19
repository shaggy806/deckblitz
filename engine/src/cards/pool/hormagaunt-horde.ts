import { defineCard } from "../define.js";
import { ravenous } from "../helpers.js";

// EDHREC rank 9967.
//
// Ravenous is the `ravenous()` helper (Aberrant). Endless Swarm is Silvan
// Reveler's graveyard landfall: it triggers only while this card is in your
// graveyard as the land enters (the ruling), and the {2}{G} is paid as the
// trigger resolves.

const RAVENOUS = ravenous();
const SWARM_TEXT =
  "Endless Swarm — Whenever a land you control enters, you may pay {2}{G}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Hormagaunt Horde",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 1,
  toughness: 1,
  text: `Ravenous (This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters.)\n${SWARM_TEXT}`,
  static: [RAVENOUS.static],
  triggered: [
    RAVENOUS.triggered,
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{G} to return Hormagaunt Horde to your hand?",
        cost: "{2}{G}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: SWARM_TEXT,
    },
  ],
});
