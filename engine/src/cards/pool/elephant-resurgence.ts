import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 27414. Each token carries its own P/T ability, so it
// keeps counting its controller's creature cards (the ruling).

export default defineCard({
  name: "Elephant Resurgence",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player creates a green Elephant creature token. Those creatures have \"This token's power and toughness are each equal to the number of creature cards in its controller's graveyard.\"",
  targets: [],
  effect: { kind: "create-token", token: "Elephant Token (Graveyard Creatures)", count: 1, who: "each-player" },
});
