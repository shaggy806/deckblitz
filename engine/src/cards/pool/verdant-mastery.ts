import { defineCard } from "../define.js";

// EDHREC rank 12511. Two splits of the finds, one after the other (a list
// `instead`): with the {3}{G} cost paid, one goes onto the battlefield tapped
// under an opponent's control — which opponent the caster chooses as it
// resolves (the ruling) — then two enter tapped under the caster's control
// and the rest go to hand. Fewer finds, and each instruction does as much as
// it can in order (rule 609.3): one find with the cost paid is the opponent's.

export default defineCard({
  name: "Verdant Mastery",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  alternativeCost: { mana: "{3}{G}" },
  text: "You may pay {3}{G} rather than pay this spell's mana cost.\nSearch your library for up to four basic land cards and reveal them. Put one of them onto the battlefield tapped under an opponent's control if the {3}{G} cost was paid. Put two of them onto the battlefield tapped under your control and the rest into your hand. Then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    min: 0,
    max: 4,
    reveal: true,
    destination: "hand",
    instead: [
      {
        destination: "battlefield",
        enterTapped: true,
        pick: "one",
        under: "an-opponent",
        condition: { kind: "self-alternative-cost-paid" },
      },
      { destination: "battlefield", enterTapped: true, pick: { exactly: 2 } },
    ],
  },
});
