import { defineCard } from "../define.js";

// Mirage. The chosen player's maximum hand size (rule 402.2), applied with
// any other change to it in timestamp order (rule 613.11).

const CHOOSE = "As this artifact enters, choose an opponent.";
const HAND = "The chosen player's maximum hand size is four.";

export default defineCard({
  name: "Cursed Rack",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${CHOOSE}\n${HAND}`,
  choosePlayerOnEnter: "opponent",
  static: [{ affects: { scope: "self" }, maxHandSize: { who: "chosen-player", set: 4 }, text: HAND }],
});
