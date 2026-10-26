import { defineCard } from "../define.js";

// Rulings: the returned creature is a new object; a token exiled this way ceases to exist and
// won't return.

export default defineCard({
  name: "Turn to Mist",
  manaCost: "{1}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Exile target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
  targets: ["creature"],
  effect: {
    kind: "flicker",
    target: 0,
    returnAt: "next-end-step",
    returnText: "Return the exiled card to the battlefield under its owner's control.",
  },
});
