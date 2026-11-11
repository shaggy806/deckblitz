import { defineCard } from "../define.js";

const MILL = "If a Zombie you control would deal combat damage to a player, instead that player mills that many cards.";
const EXILE = "Whenever a creature card is put into an opponent's graveyard from their library, exile that card and create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Undead Alchemist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 2,
  text: `${MILL}\n${EXILE}`,
  static: [
    {
      affects: { scope: "self" },
      // The damage never happens (rule 614.6): no lifelink, no "deals combat
      // damage to a player" trigger. Two Alchemists replace it once (the
      // ruling): after the first there's no damage left to replace.
      replacement: {
        event: "would-deal-damage",
        combat: true,
        source: { subtype: "Zombie", controlledBy: "you" },
        to: "player",
        instead: { effect: { kind: "mill", target: "trigger-player", amount: "x" } },
      },
      text: MILL,
    },
  ],
  triggered: [
    {
      // Each Alchemist's ability triggers for the card; the first to resolve
      // exiles it, and the rest still make a Zombie (the ruling).
      trigger: { on: "put-into-graveyard", who: "opponent", filter: { type: "creature" }, from: "library" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "create-token", token: "Zombie Token", count: 1 },
        ],
      },
      resolve: null,
      text: EXILE,
    },
  ],
});
