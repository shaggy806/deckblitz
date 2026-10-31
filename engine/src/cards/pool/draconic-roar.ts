import { defineCard } from "../define.js";

// Dragons of Tarkir (DTK). EDHREC rank 19683.
//
// "You may reveal a Dragon card from your hand" is an optional additional
// cost (rule 601.2b): the kicked variant reveals (`keyword: "reveal"`), and
// one cast without revealing is kicked anyway while its caster controls a
// Dragon as the casting finishes (`orControls` — the rulings). So "if you
// revealed a Dragon card or controlled a Dragon" is the kicked `effect`. A
// copy gets the bonus only if a card was revealed (the ruling). The target
// is the creature alone: gone, nothing is dealt to its controller.

export default defineCard({
  name: "Draconic Roar",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\nDraconic Roar deals 3 damage to target creature. If you revealed a Dragon card or controlled a Dragon as you cast this spell, Draconic Roar deals 3 damage to that creature's controller.",
  kicker: {
    cost: "",
    keyword: "reveal",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
    orControls: { subtype: "Dragon" },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 3, target: 0 },
        { kind: "damage", amount: 3, toControllerOfTarget: 0 },
      ],
    },
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
