import { defineCard } from "../define.js";

// Feasting Troll King's "if you cast it from your hand" (a copy cast from
// the hand qualifies too — the first ruling), then Sundering Growth's
// populate, which may copy the Bird just made.
const TEXT =
  "When this creature enters, if you cast it from your hand, create a 1/1 white Bird creature token with flying, then populate.";

export default defineCard({
  name: "Scion of Vitu-Ghazi",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (Create a token that's a copy of a creature token you control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "create-token", token: "Bird Token", count: 1 }, { kind: "populate" }],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
