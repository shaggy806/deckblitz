import { defineCard } from "../define.js";

// EDHREC rank 28515.

const ETB_TEXT = "When this creature enters, if it was kicked, create a 1/1 white Soldier creature token.";
const SAC_TEXT = "{1}, Sacrifice another creature: This creature gets +2/+1 until end of turn.";

export default defineCard({
  name: "Phyrexian Warhorse",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horse"],
  power: 3,
  toughness: 3,
  text: `Kicker {W} (You may pay an additional {W} as you cast this spell.)\n${ETB_TEXT}\n${SAC_TEXT}`,
  kicker: { cost: "{W}" },
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
