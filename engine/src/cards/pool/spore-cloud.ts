import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 17256.
//
// Rulings:
//   - Only makes attackers or blockers that have been declared before the spell is cast unable to
//     untap as normal next turn. Before attackers are declared it is simply a Fog.
//   - If an affected creature is untapped as its controller's next untap step begins, the
//     "doesn't untap" effect does nothing.
//   - It doesn't track the creatures' controllers: an affected creature that changed controllers
//     doesn't untap during its new controller's next untap step.
//
// Tangle's shape, with the blockers tapped first: the "doesn't untap" marks are their own steps
// (`onlyDoesntUntap`), so a creature already tapped is marked too.
export default defineCard({
  name: "Spore Cloud",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Tap all blocking creatures. Prevent all combat damage that would be dealt this turn. Each attacking creature and each blocking creature doesn't untap during its controller's next untap step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap-all", filter: { type: "creature", blocking: true } },
      { kind: "prevent-all-combat-damage" },
      { kind: "tap-all", filter: { type: "creature", attacking: true }, doesntUntapNext: true, onlyDoesntUntap: true },
      { kind: "tap-all", filter: { type: "creature", blocking: true }, doesntUntapNext: true, onlyDoesntUntap: true },
    ],
  },
});
