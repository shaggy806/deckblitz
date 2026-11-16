# Another player's choice inside a mana ability

**Status:** done (2026-11-16). Built for author-top-cards batch 333, approved by the user that day as
a major feature (a decision made by another player inside a mana ability; earlier triage runs had
sized it small, then major). Proving card: Spectral Searchlight. Tests:
`engine/src/test/mana-ability-they-choose.test.ts`; the scaffolder's template is pinned in
`oracle-parse.test.ts`; two manual checks, one at four players.

## What the card asks

Spectral Searchlight: "{T}: Choose a player. That player adds one mana of any color they choose."
Its one ruling: you may choose yourself.

- It's a **mana ability**: no target, and it could add mana (rule 605.1a). So it never uses the
  stack and resolves as soon as it's activated (605.3b), mid-payment or not (605.3a, 117.1d).
- The player is chosen while the effect is applied (608.2d), which for a mana ability is the moment
  it's activated: nothing can happen in between. The engine already named that player at activation
  for Victory Chimes and Valleymaker (`add-mana`'s `playerOfChoice`, an offer per player still in
  the game, each with its `manaFor`).
- The colour is **the chosen player's** choice ("they choose"), where every other mana ability's
  choice belongs to its controller. A player controlling the chosen player makes it for them
  (723.5).
- If a player had priority when they activated it, they get it back once it has resolved (405.6c).

## The shape

One flag on the mana, not a new effect: `add-mana`'s `theyChoose` ("the player who adds it chooses
the colour"), beside `playerOfChoice`. It reads only where it changes something:

- **The activator names themselves**: nothing new. The colour is theirs, picked as they activate,
  one offer a colour (`standaloneManaVariants`), and the auto-payer counts the source as their own
  any-colour mana, choosing themselves. So the activator never counts mana that goes to someone else
  toward their own payment: the planner never names another player.
- **The activator names another player**: one offer for that player, with no colours (the colour
  isn't the activator's to pick, and a `manaColors` sent with it is ignored). Once the cost is paid,
  `Game.resolveManaAbility` stops before making any mana and asks the chosen player.

### The decision: `choose-modes`, reused

The question is a `choose-modes` put to the chosen player, one mode a colour ("Add {R}."), with a
new field, `manaAbilityPick` (`ManaAbilityPick` in `state.ts`): the source, the ability's index, the
activator, the player the mana goes to, X, each mode's picks, and what `resolveManaAbility` had been
handed (a granted ability's ref, the cost's paid sets, a sacrificed land's colours, a reveal's start).
The engine answers it itself, as it does `untapTypes` and `rerollStored`: `applyModesChoice` clears
the question and calls `resolveManaAbility` again with the chosen picks, and the mana ability finishes
as any other does: the mana goes to the chosen player's pool, a tap doubler doubles it (Mana
Reflection), triggered mana abilities and "tapped for mana" triggers read what it made, and
`mana-ability-resolved` is announced. Then the activator gets priority back.

No new decision kind, because a colour chosen as mana is added is already a `choose-modes` everywhere
else: a spell's or a stack ability's "any color" (`effects.ts`' `addManaChoice`), and Stadium
Vendors' trigger, where the chosen player answers through `as-player`. Every module a decision needs
(the offer, the validator, the controller's arm, the bots' candidates, the fuzzer's random answer)
already handles it, and so does the client. Each mode's effect is the `add-mana` it comes to, so a
reader of the question (v1's `effectWorth`, a capture) sees mana of that colour for the chooser.

While it's asked nobody has priority (the mana ability is still resolving), the stack is untouched,
and `decisionSource` names the Searchlight, so the client heads the prompt "Spectral Searchlight —
choose one".

### Who answers, and where

The question's `player` is the chosen player, so routing is the same as for any decision:
`player-control.ts`'s `askedPlayer`/`answeringPlayer` say who answers (the chosen player, or whoever
controls them), the server's seat check refuses anyone else, and `viewFor` shows it to that seat. The
other seats see "Bob is choosing a mode". At four players the activator's menu lists their five
colours and one row each for the other three ("(Carol adds it)", from the existing `manaFor` label).

### The bots

Bots never activate a mana ability by hand (`isManaOnlyAbility`: floating mana gains them nothing),
so a bot never names another player. Asked the colour as the chosen player, v1 weighs each mode's
`add-mana` with `effectWorth` (the colour its hand wants, as for any mana-colour mode), and v2
searches it as the nested `choose-modes` it is. The fuzzer's `RandomController` does activate it for
other players, and answers at random, so the fuzzer plays the whole path.

## What it leaves out

- **A cost that itself waits on a choice**: a mana ability whose cost asks something (a discard, a
  sacrifice of several, a reveal) and also names a player resumes through
  `resolveWaitingManaAbility` and its siblings, which don't carry `manaFor` yet, so its controller
  would add the mana. No card has both (the `playerOfChoice` cards are Victory Chimes, Valleymaker and
  Spectral Searchlight, none with such a cost); carrying `manaFor` through those records is the fix
  when one comes.
- **Naming another player mid-payment by hand.** The engine pays a cost through its planner, which
  only ever names the payer; a player can float mana for someone else only while they have priority.
  Naming another player in the middle of your own payment gives you nothing toward it, so nothing is
  lost but the timing of a gift.
- **"They choose" on the stack, or for each player** ("each player adds one mana of any color they
  choose"): no card says either; the stack's version is `as-player` round a plain `add-mana` (Stadium
  Vendors). The flag is read only in a mana ability with `playerOfChoice`.
