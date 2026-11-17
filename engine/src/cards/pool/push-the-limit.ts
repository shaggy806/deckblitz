import { defineCard } from "../define.js";

// EDHREC rank 12850. "Them" is every card the return put onto the
// battlefield, remembered by the delayed ability (rule 603.7c): each is
// sacrificed only while it's still the permanent that returned (rule 400.7)
// and still yours — a player sacrifices only what they control (701.21a).
// The Vehicles become creatures after they're back, so the returned ones do
// too; the haste reaches every creature you control then, the returned
// Mounts and the animated Vehicles among them.

const RETURN =
  "Return all Mount and Vehicle cards from your graveyard to the battlefield. Sacrifice them at the beginning of the next end step.";
const ANIMATE = "Vehicles you control become artifact creatures until end of turn. Creatures you control gain haste until end of turn.";

export default defineCard({
  name: "Push the Limit",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${RETURN}\n${ANIMATE}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "return-from-graveyard",
        filter: { anyOf: [{ subtype: "Mount" }, { subtype: "Vehicle" }] },
        destination: "battlefield",
        count: "all",
      },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        remember: { returned: { set: { thisWay: "put-onto-battlefield" } } },
        effect: { kind: "sacrifice-all", who: "you", filter: { inSet: { remembered: "returned" } } },
        text: "Sacrifice them at the beginning of the next end step.",
      },
      {
        kind: "for-each-permanent",
        filter: { subtype: "Vehicle", controlledBy: "you" },
        simultaneous: true,
        effect: { kind: "become", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      },
      { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
