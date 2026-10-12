import { defineCard } from "../define.js";

// EDHREC rank 8093.
//
// Rulings:
//   [2025-07-25] If the target permanent is an illegal target as Emergency Eject tries to resolve,
//     it won't resolve and none of its effects will happen. The permanent's controller won't
//     create a Lander token.
//
// Stroke of Midnight's shape: "its controller" is whoever controlled it as it
// was destroyed (rule 608.2h), so the token comes even if it survived.

export default defineCard({
  name: "Emergency Eject",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: 'Destroy target nonland permanent. Its controller creates a Lander token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")',
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Lander Token", count: 1, who: "target-controller" },
    ],
  },
});
