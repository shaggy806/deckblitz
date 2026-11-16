# Exiling a mix of permanents and cards, chosen across zones

**Status:** done (2026-11-16). Built for author-top-cards batch 333, approved by the user as a
major feature that day. Proving cards: Lich's Mastery, Nicol Bolas, Dragon-God (the best-ranked
card missing from the pool, EDHREC 3632), Descent into Madness. Tests:
`engine/src/test/exile-from-zones.test.ts`; the scaffolder's templates are pinned in
`oracle-parse.test.ts`; three manual checks, one at four players.

## What the cards ask

- Lich's Mastery: "Whenever you lose life, for each 1 life you lost, exile a permanent you control
  or a card from your hand or graveyard." Its rulings: any mix ("one permanent, two cards from
  hand, and two cards from your graveyard"); with too little to exile, everything you can, the
  enchantment itself included, and then you lose to its last ability.
- Nicol Bolas, Dragon-God's +1: "You draw a card. Each opponent exiles a card from their hand or a
  permanent they control." Its ruling: after the draw, the next opponent in turn order chooses a
  permanent, or a card in hand without revealing it; each other opponent in turn order does the
  same, knowing the choices made before them; then all are exiled simultaneously.
- Descent into Madness: "each player exiles X permanents they control and/or cards from their
  hand". Its ruling: players after you know which permanents you'll exile and how many hand cards,
  but don't see those cards.

All three are one thing: each player exiles N of their own things from a set of their zones, any
mix, chosen in one go.

## The rules it follows

- **101.4** — players who choose "at the same time" choose in APNAP order (the active player,
  then the others in turn order), and *then* the actions happen simultaneously. So every player's
  pick is held, unmoved, until the last has chosen; then one exile of everything.
- **101.4a** — a choice in a hidden zone may stay face down while it's made. **101.4b** — a player
  knows the choices made before theirs, except as 101.4a allows. Together: the players after know
  the permanents (and graveyard cards — a public zone) by name, and the hand's picks only by how
  many — exactly Descent's ruling.
- **603.10a** — the exile is one event, so each permanent's leaves trigger sees the others go.
- **400.7** — what's exiled at the end is only what's still the object it was when chosen (its
  stint is kept with it); a pick that has moved since stays where it is.
- **608.2h** — Descent's X is read as the effect resolves, from the counters it last had if it has
  left (its ruling); `countersOn: "source"` already reads last-known information.
- **205.4e** — not this feature, but Bolas's −8: "a legendary creature or planeswalker" is read as
  the rules read the same words for legendary sorceries, a legendary creature or a legendary
  planeswalker.

## The shape

**One effect, `exile-from-zones`** (`who`, `zones`, `count`), rather than a field on `exile`,
`sacrifice` or `look-and-choose`. `look-and-choose` is already the widest effect in the
vocabulary and takes one zone; this needs the battlefield, which none of its machinery knows.
"Exile N, any mix of my zones" is its own instruction, and the three cards say it the same way.
Sacrifice and discard are different acts with their own triggers and replacements, so "sacrifice
a permanent or discard a card" is not this effect and isn't folded into it.

**No new decision kind.** The choice is the existing `choose-from-zone` decision: it already
spanned two zones for a behold (rule 701.4a — hand and battlefield), its client popup already
captions each card with where it is, and its random, v1 and v2 answers already exist. The awaiting
gains one flag, `acrossZones`, and the raise uses `keepChoice` (the answer is collected for the
resolving effect, not moved), which `choose-among-targets` and `reveal-until-count` already use.
A decision kind of its own would have duplicated all of that — offer, validator, three bot
answers, the client popup — for a choice that differs only in which ids it lists.

**The flow** is the `progress` pattern of the resumable effects: the effect lists its players in
APNAP order, asks each in turn (`askExileFromZones`), parks itself with the players left and the
picks held so far (`progress.held`, each an object and its stint), takes each answer with
`takeKept`, and when no one is left calls `exileTogether` — one leave batch and one graveyard
batch, so one `cards-put-into-exile`. A player with no more than N things exiles all of them
unasked (the ruling); a token stack then goes whole. When a choice is asked, a stack is split so as
many of its tokens as N could take are candidates (as a behold's are), and a picked token is split
off again at the exile, so one pick is one token.

**Hidden information.** The held picks live in the parked effect, which no view carries. Two other
places could leak a hand pick, and both are closed: the awaiting's hand candidates are dropped from
every other seat's view (as a behold's are), and the answer's `cards-chosen-from-zone` event —
which every seat's log reads — names only the permanents and graveyard cards, with the hand's
picks counted in `fromHand` ("Bob chooses a card from their hand"). That count is the 101.4b
knowledge the next chooser has. The cards are named once they're exiled.

## What the bots do

- **v1** (`HeuristicBotController.leastToLoseAcrossZones`): gives up the graveyard first, then the
  hand's least useful cards (`leastUsefulTo`), then the cheapest permanents (`cheapestPermanents`),
  the card that asked last of all — Lich's Mastery leaving loses the game.
- **v2**: `keepFirst` orders the candidates the same way (permanents, the asking card first, then
  the hand, the graveyard last; the candidates are tried least valuable first), and the rollouts
  judge them; the held exile resolves inside each rollout like any other parked effect. Watched in
  the manual checks: v2's evaluation sometimes gives up a land or a creature to keep a card in hand
  (Carol exiled her Hill Giant over an uncastable Shock), where v1 gives up the hand card. That is
  the evaluation's price of a hand card against a permanent, not this feature; `bot:judge --kind
  answers` is the tool if it needs a look.
- `effect-worth.ts` reads the effect as a card lost by each player it names (Bolas's +1 is worth
  something to its controller), and `target-polarity.ts` as harm to a targeted `who`.

## What it leaves out

- A **filter** on what may be exiled ("exile a nonland permanent or …"): no card yet needs one.
- **Other players' zones** ("exile a permanent an opponent controls or …"): the chooser always
  exiles their own.
- A choice between **acts** (sacrifice a permanent or discard a card): a different feature.
- Bolas's first ruling, linked abilities he gains from two planeswalkers, rests on the
  `grantsActivatedOf` static built 2026-10-31 and wasn't re-examined here.
