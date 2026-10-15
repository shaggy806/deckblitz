import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, target creature an opponent controls gets -3/-0 until end of turn.";

export default defineCard({
  name: "Sinister Cryologist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\nWarp {U} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
