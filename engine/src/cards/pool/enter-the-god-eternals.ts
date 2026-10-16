import { defineCard } from "../define.js";

export default defineCard({
  name: "Enter the God-Eternals",
  manaCost: "{2}{U}{U}{B}",
  colors: ["B", "U"],
  types: ["sorcery"],
  text:
    "Enter the God-Eternals deals 4 damage to target creature and you gain life equal to the damage dealt this way. Target player mills four cards. Amass Zombies 4. (Put four +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: ["creature", "player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      // Life equal to the damage actually dealt to that creature — more
      // beside Torbran, none once it's prevented (Creeping Bloodsucker's
      // amount).
      { kind: "gain-life", amount: { damageDealtThisWay: true, to: 0 } },
      { kind: "mill", target: 1, amount: 4 },
      { kind: "amass", amount: 4, creatureType: "Zombie" },
    ],
  },
});
