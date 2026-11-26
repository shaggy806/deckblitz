import { defineCard } from "../define.js";

// EDHREC rank 31305. Earthquake's damage-all, and a static working only while
// the spell is on the stack (`onStack`, rule 113.6b) that gives each creature
// an ability naming the spell: `prevent-damage` `from: "granter"`, a shield
// against that spell's damage alone. Once the spell has left the stack the
// ability is gone, and one still waiting to resolve does nothing (400.7).

const GRANTED = "{T}: Prevent the next 1 damage that would be dealt to this creature by Torrent of Lava this turn.";
const STACK_TEXT = `As long as Torrent of Lava is on the stack, each creature has "${GRANTED}"`;

export default defineCard({
  name: "Torrent of Lava",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Torrent of Lava deals X damage to each creature without flying.\n${STACK_TEXT}`,
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      onStack: true,
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "prevent-damage", target: "source", amount: 1, from: "granter" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STACK_TEXT,
    },
  ],
});
