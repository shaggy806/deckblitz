import { defineCard } from "../define.js";

// Theros Beyond Death. X is read once, as the trigger resolves (its rulings),
// counting the Catoblepas itself while it's still on the battlefield.

const ENTERS =
  "When this creature enters, target creature an opponent controls gets -X/-X until end of turn, where X is your devotion to black. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)";

const MINUS_X = { product: [{ devotionTo: "B" }, -1] } as const;

export default defineCard({
  name: "Blight-Breath Catoblepas",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 2,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
