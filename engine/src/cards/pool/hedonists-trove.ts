import { defineCard } from "../define.js";

// Two permissions over the cards exiled with it (rule 607.2a): lands, with no
// limit beyond the player's own land plays (305.2), and spells, one a turn
// (`oncePerTurn`, spent by a spell cast under that permission alone, so a
// land played from among them doesn't use it up).

const ENTERS_TEXT = "When this enchantment enters, exile target opponent's graveyard.";
const LANDS_TEXT = "You may play lands from among cards exiled with this enchantment.";
const SPELLS_TEXT =
  "You may cast spells from among cards exiled with this enchantment. You can't cast more than one spell this way each turn.";

export default defineCard({
  name: "Hedonist's Trove",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${LANDS_TEXT}\n${SPELLS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: ENTERS_TEXT,
      targets: ["opponent"],
      effect: { kind: "exile-graveyard", target: 0, linked: true },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: LANDS_TEXT,
      mayPlay: { from: "exile", play: true, filter: { type: "land" }, linked: true },
    },
    {
      affects: { scope: "self" },
      text: SPELLS_TEXT,
      mayPlay: { from: "exile", filter: {}, linked: true, oncePerTurn: true },
    },
  ],
});
