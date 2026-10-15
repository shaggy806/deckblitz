import { defineCard } from "../define.js";

// EDHREC rank 22195. Agonasaur Rex's cycle trigger, with a required target an
// opponent controls.

const CYCLE_TEXT =
  "When you cycle this card, target creature or Vehicle an opponent controls gets -3/-0 until end of turn.";

export default defineCard({
  name: "Howler's Heavy",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Seal", "Pirate"],
  power: 3,
  toughness: 4,
  cycling: { cost: "{1}{U}" },
  text: `Cycling {1}{U} ({1}{U}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
      ],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
