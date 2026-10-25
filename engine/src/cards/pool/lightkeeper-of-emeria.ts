import { defineCard } from "../define.js";

// Worldwake (WWK). "For each time it was kicked" is `{ timesKicked: "source" }`,
// the count it entered with (0 when it wasn't kicked).

const ENTER_TEXT = "When this creature enters, you gain 2 life for each time it was kicked.";

export default defineCard({
  name: "Lightkeeper of Emeria",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Multikicker {W} (You may pay an additional {W} any number of times as you cast this spell.)\nFlying\n${ENTER_TEXT}`,
  kicker: { cost: "{W}", multi: true },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [2, { timesKicked: "source" }] } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
