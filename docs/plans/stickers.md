# Stickers

Status: done — name stickers, the sheets and the decision, engine and client (2026-11-16, for
author-top-cards batch 333). Ability, power/toughness and art stickers and tickets are not built.

Unfinity's stickers (rule 123): a player who plays with them brings at least ten sticker sheets,
three of which are chosen at random as the game begins; cards then say "put a name sticker on it",
which adds the sticker's word to that object's name, and read what's on it ("for each unique vowel
on that sticker"). The user approved the subsystem as a major feature of batch 333, for _____
Goblin (EDHREC 6769). The proving cards are _____ Goblin, _____ Bird Gets the Worm and Wizards of
the _____.

## The shape, and why

**The sheets are data, pinned against the Oracle snapshot.** Rule 123.2 says sheets "are not
cards and have no characteristics"; they are the 48 of Unfinity Sticker Sheets (SUNF), which the
checked-in snapshot (`engine/data/oracle/cards.jsonl`) carries with `type_line: "Stickers"`.
`stickers.ts`'s `STICKER_SHEETS` holds each sheet's collector number and its three name stickers;
Scryfall names every sheet for those three, so `test/stickers.test.ts` checks the list against the
snapshot's sheets, name and number, and that each sheet's stickers spell its name. One sheet has a
two-word sticker, "Hot Dog" (Ancestral Hot Dog Minotaur); the split is the only thing the snapshot
can't confirm. The sheets' ability and power/toughness stickers (their Oracle text) and art
stickers aren't kept: nothing in the pool puts one. Real data only, as for cards.

**Which sheets a player has is `PlayerState.stickerSheets`, decided at setup (rules 103.2d,
123.2a).** A deck may name its own sheets (`DeckList.stickerSheets`: at least ten, unique —
`stickerSheetProblems` says what's wrong with a list, for the server once a deck can carry one).
With none named, a deck holding a card that puts stickers (`putsStickers`: a `put-sticker` effect
anywhere in its definition) brings every sheet there is — 123.2a sets a minimum and no maximum, so
that's a selection a player could make — and any other deck plays without them. Three are taken
at random from the seeded stream, after the library and the Attraction deck, and only for a player
with sheets, so a game without stickers draws exactly as before; with `shuffle` off (tests, the
scenario builder) the first three. They stay revealed (123.2c): every seat's view has each player's
sheets and which of their stickers are on something (`PlayerView.stickerSheets`), shown as a 🏷️
on the player panel.

**A sticker is a record on the object, `GameObject.stickers` (`PlacedSticker`).** Not an object, a
counter or a token (123.1): its sheet and index say which sticker it is, its text what it says, its
`position` after how many words it went, and its `timestamp` where it falls among the object's other
name changes. "Not currently on any objects they own" (123.3) is read by scanning the objects the
player owns (`availableNameStickers`), not kept as a separate list that could drift. 123.5: the
stickers stay with the object into another public zone, an exception to 400.7, each re-stamped in
the order it had (613.7k), and are dropped as it goes to a hand or library — `moveObject`, beside
the other per-object resets. They aren't copiable values (123.1, 707.2), so a copy has none.
`tokenFoldKey` includes them, so a stickered token never folds into a stack (each sticker is one
object's, 123.3a), and putting one on a stacked token splits it off first.

**The name is still `nameOf`, now in timestamp order with the stickers (123.6c).** Start from the
copiable name (none when face down, 708.2a); the latest effect that names it (612.8 — Witness
Protection) replaces it; every sticker put on after that adds its words. `nameIfAny` is the same
read with `null` for no name, which is what a sticker adds to (123.6b: "If that object has no name,
its name becomes the word"). Every reader of names — the legend rule, "named …", the view's `name`
— gets the sticker without changing.

**A blank line where the words go is filled by them — the one call the rules leave open.** 123.6a
says a blank ("_____ Goblin") isn't a word, and nothing more. The card is printed with the blank for
the sticker, and the sticker covers it, so `nameWithSticker` puts the words in place of the first
blank at the place chosen: "Hot Dog Goblin", not "Hot Dog _____ Goblin". A sticker put elsewhere
leaves the blank ("_____ Goblin Hot Dog"); a second blank waits for a second sticker ("_____ _____
Rocketship"). Only whole-word blanks are: "_____-o-saurus" has its blank inside a hyphenated word,
which 123.6a counts as a word, so that card is left for whoever decides what a sticker there makes.

**One decision, `put-name-sticker` (the 34th kind), in two parts that are usually one answer.**
The putter is the effect's controller and must own the object (123.3b: otherwise that part does
nothing); they choose the sticker, or none where the card says "may". The object's controller
chooses where it goes (123.6b): at the beginning or after any number of its words. When those are
one player, which is nearly always, one answer carries both; when someone else controls it (stolen
in response), the controller is then asked for the place (`stage: "place"`). The offer lists the
stickers with their unique vowels, the name each place would make (`names[i][p]`), and `fill`, the
place a blank waits at. The client asks in the banner: a button per sticker, then a button per name
when there's more than one place (`ui/NameStickerChoice.tsx`). The new name is announced
(`name-sticker-put` in the log).

**"That sticker" is read through `then`, as X.** `put-sticker`'s `count` says what to count on the
sticker it put (`"unique-vowels"`, 123.6e: A, E, I, O, U and Y, each once, either case) and `then`
carries on the resolution with that as X — the same carry-over a chosen number uses
(`ResolutionResume`). `then` follows only once a sticker is on: every card that reads the sticker
reads nothing without one ("Add {R} for each unique vowel on that sticker" adds none; Wizards of the
_____ looks at none), so the two are the same. A card whose next words happen either way puts them
after the `put-sticker` instead, and the scaffolder writes it so.

## What the bots do with it

A plain controller (v1, and every scripted seat's default) puts the sticker with the most of what
the card counts — for _____ Goblin, the most unique vowels, the first of those tied — where the
name's blank is, and never declines: a sticker costs nothing but being in use. v2 searches the
stickers in that order, each at the blank, and none last. Nothing reads a name sticker as worth
anything on the board; the payoffs (mana, life, cards) are what the evaluation sees.

## What it leaves out

- Ability stickers (123.7), power/toughness stickers (123.8), art stickers (123.9) and the ticket
  costs and `{TK}` counters that pay for them (107.17, 123.3c, 123.3d); "put a sticker" of any kind
  (Aerialephant, Command Performance and most of the `mechanic:stickers` cards); sticker kicker
  (702.33h). They need the sheets' ability text authored as abilities and art the snapshot doesn't
  have.
- Triggers on putting a sticker ("Whenever you put a sticker on …"), "stickered" (123.4, built as
  `isStickered` but read by no filter yet), counting letters across an object's name stickers
  (`letterCount` is there), and putting a sticker on a card in a graveyard (Scampire).
- Melded and merged permanents' stickers (123.5a–c): a sticker on a merged permanent stays with the
  object keeping its id as it leaves, where 123.5c lets its owner choose which card keeps it. No
  card in the pool can sticker one yet.
- The deck builder and the decklist import don't let a player name their sheets: a deck with a
  sticker card brings all 48.
