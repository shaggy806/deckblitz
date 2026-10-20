import { defineCard } from "../define.js";

// EDHREC rank 19156.

export default defineCard({
  name: "Practiced Tactics",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose target attacking or blocking creature. Practiced Tactics deals damage to that creature equal to twice the number of creatures in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", amount: { product: [{ partySize: "you" }, 2] }, target: 0 },
});
