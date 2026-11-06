import { defineCard } from "../define.js";

// The attack tax is one {W/P} a creature (rule 508.1h), each paid with {W}
// or 2 life as its attacker chooses (rule 107.4f; its ruling), two Annexes
// two pips a creature. A creature that must attack needn't pay (its ruling,
// 508.1d).
const TEXT =
  "Creatures can't attack you or planeswalkers you control unless their controller pays {W/P} for each of those creatures.";

export default defineCard({
  name: "Norn's Annex",
  manaCost: "{3}{W/P}{W/P}",
  colors: ["W"],
  types: ["artifact"],
  text: `({W/P} can be paid with either {W} or 2 life.)\n${TEXT}`,
  static: [{ affects: { scope: "self" }, attackTax: { phyrexian: "W", covers: "you-and-planeswalkers" }, text: TEXT }],
});
