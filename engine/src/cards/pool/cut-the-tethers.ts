import { defineCard } from "../define.js";

// "That player" is the owner the sentence names. Each owner answers in turn order, then they go back
// at once (rule 101.4), so a Spirit tapped for mana to pay for another can still be let go.

export default defineCard({
  name: "Cut the Tethers",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each Spirit, return it to its owner's hand unless that player pays {3}.",
  effect: {
    kind: "for-each-unless",
    of: { permanents: { subtype: "Spirit" } },
    asks: "owner",
    options: [{ pay: "{3}", text: "Pay {3} for {it}" }],
    otherwise: { kind: "return-to-hand", target: 0, atRelease: true },
  },
});
