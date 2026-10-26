import { defineCard } from "../define.js";

// EDHREC rank 5074.

export default defineCard({
  name: "Entreat the Angels",
  manaCost: "{X}{X}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  miracle: { cost: "{X}{W}{W}" },
  text: "Create X 4/4 white Angel creature tokens with flying.\nMiracle {X}{W}{W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  effect: { kind: "create-token", token: "4/4 Angel Token", count: "x" },
});
