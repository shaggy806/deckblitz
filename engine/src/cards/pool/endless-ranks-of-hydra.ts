import { defineCard } from "../define.js";

// EDHREC rank 15336.

const RETURN_TEXT =
  "Whenever your commander enters or attacks, you may pay {1}{B}. If you do, return this card from your graveyard to your hand.";
// "Your commander" is one you own, whoever controls it (Tome of Legends'
// reading).
const YOUR_COMMANDER = { isCommander: true, ownedBy: "you" } as const;
// Spit Flame's shape: it returns its own card from the graveyard, so it works
// only there (rule 113.6k), and returns that card — nothing if it has left the
// graveyard since.
const PAY_AND_RETURN = {
  kind: "may",
  prompt: "Pay {1}{B} to return Endless Ranks of HYDRA to your hand?",
  cost: "{1}{B}",
  effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
} as const;

export default defineCard({
  name: "Endless Ranks of HYDRA",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `For each opponent, you create a 2/1 black Villain creature token with menace.\n${RETURN_TEXT}`,
  effect: { kind: "create-token", token: "Villain Token", count: { countPlayers: "each-opponent" } },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "any", filter: YOUR_COMMANDER },
      targets: [],
      effect: PAY_AND_RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "attacks", who: "any", filter: YOUR_COMMANDER },
      targets: [],
      effect: PAY_AND_RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
