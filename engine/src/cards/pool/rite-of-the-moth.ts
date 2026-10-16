import { defineCard } from "../define.js";

// EDHREC rank 16679.
//
// Grim Reaper's Scythe's return as a sorcery, with flashback. The finality
// counter needs no rider of its own: `moveObject` exiles a permanent with one
// that would go to a graveyard.
export default defineCard({
  name: "Rite of the Moth",
  manaCost: "{1}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  flashback: { cost: "{3}{W}{W}{B}" },
  text: "Return target creature card from your graveyard to the battlefield with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)\nFlashback {3}{W}{W}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
});
