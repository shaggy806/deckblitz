import { defineCard } from "../define.js";

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const LIFE_TEXT = "Pay 8 life: Untap this creature.";
const BLOCK_TEXT = "This creature can't be blocked except by three or more creatures.";

export default defineCard({
  name: "Phyrexian Colossus",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Golem"],
  power: 8,
  toughness: 8,
  text: `${UNTAP_STEP_TEXT}\n${LIFE_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT },
    { affects: { scope: "self" }, restrictions: [{ kind: "cant-be-blocked", byFewerThan: 3 }], text: BLOCK_TEXT },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 8 },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
