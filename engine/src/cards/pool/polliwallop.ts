import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 8279. Bloomburrow.
//
// Punishing Punch's damage — the first target's power read as it resolves,
// twice over, dealt by that creature — with affinity for Frogs. Either
// target illegal, nothing is dealt (the ruling): with the second gone the
// damage has nowhere to go, with the first gone it has no source.
export default defineCard({
  name: "Polliwallop",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Affinity for Frogs (This spell costs {1} less to cast for each Frog you control.)\nTarget creature you control deals damage equal to twice its power to target creature you don't control.",
  selfCostReduction: affinity({ subtype: "Frog" }),
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "damage", amount: { product: [{ powerOf: 0 }, 2] }, target: 1, from: { target: 0 } },
});
