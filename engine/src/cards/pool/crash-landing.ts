import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 29441.
//
// The target must have flying (the ruling); it loses flying first, then takes
// damage equal to the Forests you control as the spell resolves.

export default defineCard({
  name: "Crash Landing",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature with flying loses flying until end of turn. Crash Landing deals damage to that creature equal to the number of Forests you control.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
      {
        kind: "damage",
        amount: { countOf: { subtype: "Forest", controlledBy: "you" } },
        target: 0,
      },
    ],
  },
});
