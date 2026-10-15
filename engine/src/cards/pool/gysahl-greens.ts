import { defineCard } from "../define.js";

// EDHREC rank 9499.
// Makes Bird → use "Chocobo Bird Token" (Chocobo Racetrack's, the same 2/2 green Bird with
// the landfall pump).

export default defineCard({
  name: "Gysahl Greens",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{6}{G}" },
  text: 'Create a 2/2 green Bird creature token with "Whenever a land you control enters, this token gets +1/+0 until end of turn."\nFlashback {6}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)',
  targets: [],
  effect: { kind: "create-token", token: "Chocobo Bird Token", count: 1 },
});
