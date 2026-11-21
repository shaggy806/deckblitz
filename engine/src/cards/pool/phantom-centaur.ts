import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with three +1/+1 counters on it.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Remove a +1/+1 counter from this creature.";

// Rulings: damage from a black source is prevented by protection or by its
// own ability, its controller's choice (rule 616.1 — `Game.damageOrderAsked`);
// protection first removes no counter. The damage is prevented even with no
// counter left; damage from several sources at once is one event, so only one
// counter goes (`perEvent`).
export default defineCard({
  name: "Phantom Centaur",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Spirit"],
  power: 2,
  toughness: 0,
  text: `Protection from black\n${ENTER_TEXT}\n${PREVENT_TEXT}`,
  static: [
    { affects: { scope: "self" }, protection: { colors: ["B"] }, text: "Protection from black" },
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true, then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 }, perEvent: true },
        to: "self",
      },
      text: PREVENT_TEXT,
    },
  ],
});
