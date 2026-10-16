import { defineCard } from "../define.js";

// EDHREC rank 9390. Bloomburrow.
//
// Stormchaser's Talent's Otter. "Cast from anywhere other than your hand" is
// Antiquities on the Loose's condition — cast, and not from the hand, so a
// copy (never cast) gets no counter — and the counter goes on the token this
// made, once it has entered (`thenCounters`).
const TOKEN = "Otter Token";

export default defineCard({
  name: "Otterball Antics",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{3}{U}" },
  text: "Create a 1/1 blue and red Otter creature token with prowess. If this spell was cast from anywhere other than your hand, put a +1/+1 counter on that creature. (Whenever you cast a noncreature spell, a creature with prowess gets +1/+1 until end of turn.)\nFlashback {3}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "source", filter: { cast: true } },
        { kind: "not", of: { kind: "source", filter: { castFrom: "hand" } } },
      ],
    },
    then: { kind: "create-token", token: TOKEN, count: 1, thenCounters: { kind: "+1/+1", amount: 1 } },
    else: { kind: "create-token", token: TOKEN, count: 1 },
  },
});
