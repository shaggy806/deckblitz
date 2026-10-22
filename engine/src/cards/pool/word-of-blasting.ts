import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 32003.
//
// Tunnel's destroy, then damage to the Wall's controller equal to its mana
// value — both read as the Wall last existed on the battlefield (rule 608.2h).

export default defineCard({
  name: "Word of Blasting",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target Wall. It can't be regenerated. Word of Blasting deals damage equal to that Wall's mana value to the Wall's controller.",
  targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "damage", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
    ],
  },
});
