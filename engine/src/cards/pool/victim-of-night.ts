import { defineCard } from "../define.js";

// EDHREC rank 9990.

export default defineCard({
  name: "Victim of Night",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target non-Vampire, non-Werewolf, non-Zombie creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Vampire", "Werewolf", "Zombie"] } }],
  effect: { kind: "destroy", target: 0 },
});
