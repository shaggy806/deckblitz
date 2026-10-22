import { defineCard } from "../define.js";

// The half of Start // Finish cast from the hand.
const FACES = ["Start // Finish", "Start", "Finish"];

export default defineCard({
  name: "Start",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create two 1/1 white Warrior creature tokens with vigilance.",
  effect: { kind: "create-token", token: "Warrior Token (Vigilance)", count: 2 },
  faces: FACES,
  split: true,
});
