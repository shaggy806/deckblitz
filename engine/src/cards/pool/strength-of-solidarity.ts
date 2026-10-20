import { defineCard } from "../define.js";

export default defineCard({
  name: "Strength of Solidarity",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose target creature you control. Put a +1/+1 counter on it for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  targets: ["creature-you-control"],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { partySize: "you" } },
});
