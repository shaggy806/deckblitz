import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 28857.
//
// A spell that's both green and blue triggers both abilities, removing two
// counters; with none left, a trigger does nothing (the rulings).

const COUNTERS_TEXT = "This creature enters with four -1/-1 counters on it.";
const SHROUD_TEXT = "{G/U}: This creature gains shroud until end of turn. (It can't be the target of spells or abilities.)";
const GREEN_TEXT = "Whenever you cast a green spell, remove a -1/-1 counter from this creature.";
const BLUE_TEXT = "Whenever you cast a blue spell, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Sturdy Hatchling",
  manaCost: "{3}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  text: `${COUNTERS_TEXT}\n${SHROUD_TEXT}\n${GREEN_TEXT}\n${BLUE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 4 } },
      text: COUNTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G/U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: SHROUD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: GREEN_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: BLUE_TEXT,
    },
  ],
});
