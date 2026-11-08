import { defineCard } from "../define.js";

const MONARCH = "When this creature enters, you become the monarch.";
const ATTACK = "This creature can't attack unless defending player is the monarch.";

export default defineCard({
  name: "Crown-Hunter Hireling",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Mercenary"],
  power: 4,
  toughness: 4,
  text: `${MONARCH}\n${ATTACK}`,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", unlessDefender: { holds: { kind: "monarch", who: "you" } } }], text: ATTACK }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH,
    },
  ],
});
