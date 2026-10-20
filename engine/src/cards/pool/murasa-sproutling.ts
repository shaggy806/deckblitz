import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, if it was kicked, return target card with a kicker ability from your graveyard to your hand.";

export default defineCard({
  name: "Murasa Sproutling",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 3,
  toughness: 3,
  text: `Kicker {1}{G} (You may pay an additional {1}{G} as you cast this spell.)\n${ENTER_TEXT}`,
  kicker: { cost: "{1}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { hasKicker: true } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
