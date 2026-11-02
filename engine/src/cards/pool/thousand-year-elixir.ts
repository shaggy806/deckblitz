import { defineCard } from "../define.js";

const HASTE = "You may activate abilities of creatures you control as though those creatures had haste.";
const UNTAP = "{1}, {T}: Untap target creature.";

export default defineCard({
  name: "Thousand-Year Elixir",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${HASTE}\n${UNTAP}`,
  static: [{ affects: { scope: "self" }, activateAsThoughHaste: { type: "creature" }, text: HASTE }],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP,
    },
  ],
});
