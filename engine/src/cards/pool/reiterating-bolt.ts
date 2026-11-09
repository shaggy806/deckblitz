import { defineCard } from "../define.js";

export default defineCard({
  name: "Reiterating Bolt",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  replicate: { cost: "", also: { text: "Pay {E}{E}{E}", do: { kind: "pay-energy", amount: 3 } } },
  text:
    "Replicate\u2014Pay {E}{E}{E}. (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nReiterating Bolt deals 3 damage to target creature or planeswalker.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", target: 0, amount: 3 },
});
