import { defineCard } from "../define.js";

// EDHREC rank 9353. The graveyard cast is Karador's once-a-turn permission,
// over artifact spells (as the face cast, rule 601.3e), with `entersTapped`;
// the Tools trigger is Pyreswipe Hawk's.
//
// Rulings:
//   The value of X is calculated only once, as Edgar's last ability resolves.
//   Edgar must be under your control in order to start casting an artifact spell using its first
//     ability, but it doesn't need to stay under your control throughout that process or be
//     under your control as the spell resolves.
//   You must still pay all costs and follow any timing restrictions and permissions for
//     artifact spells you cast from your graveyard this way.
//   If an artifact you control has {X} in its mana cost, X is 0 for the purpose of calculating
//     its mana value.

const CAST_TEXT =
  "Once during each of your turns, you may cast an artifact spell from your graveyard. If you cast a spell this way, that artifact enters tapped.";
const TOOLS_TEXT =
  "Tools — Whenever Edgar attacks, it gets +X/+0 until end of turn, where X is the greatest mana value among artifacts you control.";

export default defineCard({
  name: "Edgar, Master Machinist",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Noble"],
  power: 2,
  toughness: 4,
  text: `${CAST_TEXT}\n${TOOLS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        filter: { type: "artifact" },
        oncePerTurn: true,
        yourTurnOnly: true,
        entersTapped: true,
      },
      text: CAST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { aggregate: "max", of: "mana-value", filter: { type: "artifact", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TOOLS_TEXT,
    },
  ],
});
