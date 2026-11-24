# Deck guides: what each strong deck's builder says its plan is

Status: **the two guides there are, built** (2026-11-24); the other seven decks have none yet.
Each guide becomes its deck's entry in `engine/src/deck-bias.ts`, the way pbToast's became The
First Sliver's: the guide tried point by point on boards, what the bot gets wrong made a value
the search can act on (a card's worth by zone, a life goal, an own weight, a polarity, a mulligan
rule), each pinned by a gate scenario that fails without it, and the deck benched on the rooms'
clock with and without its entry, in more than one seat. `deck-biases.md` has what each entry
became and what was left out.

**The seven with no guide.** The user's three ways to one (2026-11-24): he gleans a strategy
from playing the deck himself; we look for a deck with the same commander that has a primer; or
the bots' own games are watched and a guide written from what wins and loses them
(`bot:watch`, `bot:losses`). None is started.

Each guide below is its builder's, from the deck's own page (`credit` in
`engine/src/strong-decks.ts`), set down here as notes: every point kept, the wording ours. The
repository is public, so the guides' own text isn't copied into it; the user's pastes are kept
beside the checkout in `.scratch/deck-guides/` (ignored by git) for the session that builds
them. "In the list" was checked against the deck as the pool plays it on the day the guide
arrived.

Guides in, and built: The First Sliver, Edgar Markov, Giada. With no guide: Krenko, The
Ur-Dragon, Y'shtola, Lathril, Pantlaza, Atraxa, Ureni. The "For the build" notes under each deck
are the leads as they stood before the boards were tried; `deck-biases.md` says which held.

## Edgar Markov ("High Power Aristocrats", by Ozymandias-)

**What the deck is.** An aristocrats deck, not an aggro one, and its builder says so twice: the
free Vampire tokens are the deck's resource, to be sacrificed for cards and for the pieces that
end the game, not swung at faces. Expect to be the table's enemy.

**General play.**

1. Don't spend creatures on attacks for their own sake; the tokens are a resource to manage.
2. Take combat damage where it is free, but don't overextend: combat isn't the plan.
3. Do sacrifice creatures to draw into better cards or the pieces that close the game.
4. Plan on the other three players turning on it.

**Opening hands.** At least two lands and at least one piece of card draw; the draw is required,
since the deck wins by digging. Better still with any of, in no order: a one-mana Vampire;
Bloodchief Ascension (cast on turn 1 to 3, it gains life all game, punishes a board wipe, and can
win a long game alone if nobody removes it); Vampiric Tutor; Impact Tremors; any sacrifice
outlet.

**Strategy.** Protect the creatures, since they are what the sacrifice engine runs on. The usual
win is slow: play defensively, hold the board, gain some life, and assemble the win, though a big
swing does sometimes end it. Early, control the board and slow the others with Dictate of Erebos,
Grave Pact, Contamination, Authority of the Consuls and above all Priest of Forgotten Gods (which
does several jobs), buying time to develop and draw into a win.

**How it wins**, as the builder lists them:

1. Bolas's Citadel with Necropotence: dig through the library without the land drop stopping it,
   since a land on top that can't be played is exiled and the dig goes on.
2. Bolas's Citadel with Ayara, First of Locthwain or an Impact Tremors effect, and a run of
   Vampires off the top: enough pings to finish the table.
3. A wide board of Vampires, then Malakir Bloodwitch (with or without the Citadel).
4. Bloodthirsty Conqueror with Vito, Thorn of the Dusk Rose: infinite once it gains any life or
   deals an opponent any damage.
5. Bloodchief Ascension with a board wipe.
6. Funeral Room unlocked into Awakening Hall, with Impact Tremors or its like already out.
7. Phyrexian Altar, Oathsworn Vampire and any life gain or drain: the Oathsworn Vampire and a
   token sacrificed over and over, for as many enters and dies triggers as wanted.
8. Inkshield: a fog that makes an army, and a win with Impact Tremors or its like out.
9. Blood for the Blood God!: a finisher at times, though 8 damage alone seldom is; as good used
   to refill the hand.
10. Bloodletter of Aclazotz: supports most of the lines above, strong alone, and makes combat
    damage a way to win.

**In the list:** every card named but Blood for the Blood God!.

**For the build** (leads, not decisions):

- The guide's heart is restraint in combat. For every deck alike, a wider margin before
  attacking was measured and left alone (`docs/plans/bot-next-steps.md`, the swing-back margin);
  for this deck alone, an own weight on its creatures staying home is the lever to try, judged
  by playout, not by rule.
- The opening hand asks for a card of a *kind* (card draw), not a count of lands: `mulligan`
  has only `minLands` today.
- Lines 1, 4 and 7 are loops the search has to find or be told: the Conqueror and Vito together,
  and the Altar with the Oathsworn Vampire, are `cardWorth` candidates only as far as "these two
  out together are worth more than each".
- The control pieces (Dictate, Grave Pact, Contamination, Authority, the Priest) are passive
  permanents the evaluation floors at a creature of their cost; the guide says they come first.

## Giada, Font of Hope ("Miku Angelic Life Gain", by SmokyCashew01)

**What the deck is.** Angels and life gain, where the life total is itself how the deck wins,
and is spent as freely as it is gained.

**How it wins.**

- Test of Endurance wins outright once it has 50 life; Hall of Heliod's Generosity brings the
  Test back from the graveyard as often as it is removed.
- Aetherflux Reservoir turns 50 life into 50 damage at instant speed, at one opponent or, with
  enough life, each in turn.
- Angel of Destiny makes a player it attacked lose while its controller holds the life the card
  asks for (the builder says 55).

**Without one of those in hand.** The deck is all Angels: big fliers that win in the air. It
runs many cost reducers for white spells and for Angels to bring them out early, and many token
makers, whose tokens are there to block and to be sacrificed.

**The fallback.** Mass destruction it is built to live through: sorceries and instants that
destroy every creature, every permanent, even every land, beside protection (for a turn or for
good) that leaves its own board standing. The others are left with nothing while it holds its
cards. The builder's favourite: Worldslayer on Avacyn, Angel of Hope.

**Its level.** A casual deck by its builder's own word: not a match for tuned decks, and salty
at a friendly table.

**In the list:** Test of Endurance, Hall of Heliod's Generosity, Aetherflux Reservoir, Angel of
Destiny, Avacyn, Angel of Hope, Worldslayer; of the wipes and protection, Wrath of God,
Armageddon, Hour of Revelation, Teferi's Protection and Akroma's Will among them.

**For the build** (leads, not decisions):

- Its own life is worth more to it than the shared weight says, and more still near 50 with a
  win condition out or in hand: an own weight on `life`, or a `cardWorth` that depends on a
  threshold, which the vocabulary doesn't have.
- A wipe cast with its own protection up (Avacyn out, Teferi's Protection in hand) is the line
  the guide prizes; the bots hold a wipe that takes their own board (`holdsWipeForCombat`), so
  the question is whether the search sees the protection.
- Worldslayer wants Avacyn as its host: an Equipment's worth is its host's today.
- Hall of Heliod's Generosity on a Test of Endurance in the graveyard is The First Sliver's
  Mistveil Plains again (a land's ability moving the key card up its ladder).
