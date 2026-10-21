import { defineCard } from "../define.js";

// EDHREC rank 9209.
//
// Rulings:
//   [2019-10-04] You can't sacrifice more than two Foods to create more than one Giant token.
//   [2019-10-04] You choose whether to sacrifice two Foods as Giant Opportunity resolves, not as
//     you cast it.
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token.
//
// The sacrifice is offered only with two Foods to sacrifice (rule 118.3);
// declining, or being unable to, is the "Otherwise".

export default defineCard({
  name: "Giant Opportunity",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You may sacrifice two Foods. If you do, create a 7/7 green Giant creature token. Otherwise, create three Food tokens. (They're artifacts with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "you",
    options: [{ sacrifice: { subtype: "Food" }, count: 2, text: "Sacrifice two Foods" }],
    ifDid: { kind: "create-token", token: "Giant Token", count: 1 },
    ifDidnt: { kind: "create-token", token: "Food Token", count: 3 },
  },
});
