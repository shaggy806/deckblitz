import { defineCard } from "../define.js";

const FACES = ["Said // Done", "Said", "Done"];
const SAID_TEXT = "Return target instant or sorcery card from your graveyard to your hand.";

export default defineCard({
  name: "Said",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: SAID_TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  faces: FACES,
  split: true,
});
