import { defineCard } from "../define.js";

// EDHREC rank 26287.
//
// Gatekeeper: an intervening-if (Plaza of Harmony's condition), checked as it
// triggers and again as it resolves.

const TEXT =
  "When this creature enters, if you control two or more Gates, target creature an opponent controls gets -2/-2 until end of turn.";

export default defineCard({
  name: "Ubul Sar Gatekeepers",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
