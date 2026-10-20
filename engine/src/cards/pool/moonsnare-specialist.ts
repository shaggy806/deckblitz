import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const ENTER_TEXT = "When this creature enters, return up to one target creature to its owner's hand.";

export default defineCard({
  name: "Moonsnare Specialist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 2,
  toughness: 2,
  text: `${ninjutsuText("{2}{U}")}\n${ENTER_TEXT}`,
  activated: [ninjutsu("{2}{U}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
