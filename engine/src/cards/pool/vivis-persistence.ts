import { defineCard } from "../define.js";

const WIZARD_TEXT =
  'Create a 0/1 black Wizard creature token with "Whenever you cast a noncreature spell, this token deals 1 damage to each opponent."';
const RETURN_TEXT =
  "Whenever your commander enters or attacks, you may pay {2}. If you do, return this card from your graveyard to your hand.";
// Endless Ranks of HYDRA's shape: a trigger that works only from the
// graveyard (rule 113.6k) on a commander you own entering or attacking. The
// Wizard is Kuja's.
const YOUR_COMMANDER = { isCommander: true, ownedBy: "you" } as const;
const PAY_AND_RETURN = {
  kind: "may",
  prompt: "Pay {2} to return Vivi's Persistence to your hand?",
  cost: "{2}",
  effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
} as const;

export default defineCard({
  name: "Vivi's Persistence",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${WIZARD_TEXT}\n${RETURN_TEXT}`,
  effect: { kind: "create-token", token: "Wizard Token (Kuja)", count: 1 },
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
