import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14960. "Fishing Pole" in the granted ability is the Equipment
// that grants it (rule 201.5a, the ruling), in its cost and its effect alike:
// "Tap Fishing Pole" is the cost act `{ kind: "tap", target: "granter" }`,
// payable while it's untapped (rules 118.3, 701.26a) — no {T}, so a sick
// creature's rule (302.6) says nothing of it — and the bait counter goes on
// it only while it's still that permanent (400.7). "If you do": no counter to
// remove, or the Pole gone, no Fish.
//
// Rulings:
//   [2024-11-08] The ability granted by Fishing Pole's first ability refers only to the Fishing Pole
//     granting that ability, not any other permanent on the battlefield named Fishing Pole.

const GRANTED = "{1}, {T}, Tap Fishing Pole: Put a bait counter on Fishing Pole.";
const GRANT_TEXT = `Equipped creature has "${GRANTED}"`;
const FISH_TEXT =
  "Whenever equipped creature becomes untapped, remove a bait counter from this Equipment. If you do, create a 1/1 blue Fish creature token.";

export default defineCard({
  name: "Fishing Pole",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\n${FISH_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true, do: { kind: "tap", target: "granter" } },
          targets: [],
          effect: { kind: "add-counter", target: "granter", counter: "bait", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "becomes-untapped", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "bait", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "bait", amount: 1 },
            { kind: "create-token", token: "Fish Token", count: 1 },
          ],
        },
      },
      resolve: null,
      text: FISH_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
