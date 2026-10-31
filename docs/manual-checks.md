# Quick tests to play by hand

Status: **open checklist**, started 2026-10-03; rewritten as quick tests 2026-10-22. Each test
below checks **one thing** a player sees — a prompt that appears and reads right, or a rules call
the engine had to get right — on a board that's ready to play.

How to use it: start a dev server with the builder (the `dev-up` skill), open **Scenario builder**
from the landing page, and work down its **Manual checks** list. **Play this test ▶** loads the
board and starts play; do what **Do** says and look for what **Expect** says. **Passed — next ✓**
ticks it off and plays the next one. If the result is wrong, add a line to `BACKLOG.md` and keep
the test; once a test checks out, it can be deleted here. You are alice, at your own precombat
main unless the test says otherwise; opponents are bots unless the test has you play one of them.
Then you don't need to do anything to switch: with **Follow the action** on (the builder's seat
strip, on by default) you're moved to whichever of your seats must act, the move announced with
"You are now Bob" and the table framed in that seat's colour; the strip's buttons ("Switch to Bob")
switch by hand, the seat the game waits on lit up. A test's "Switch to Bob" / "back as Alice" is
that button — often already done for you by following.

Writing a test (each authoring pass adds them for the decisions and rules calls it introduces):

    ### <Card name>: <the one thing checked>
    - **Do:** <one or two short steps>
    - **Expect:** <one to three short sentences: exactly what to see, quoting the UI's words>
    - **Not a bug:** <optional: correct behaviour a tester would otherwise report>

with exactly one board under the same title in `client/src/builder/manualChecks.ts` (a server
test, `manual-check-presets.test.ts`, builds every board and matches them to the headings). One
thing per test, its own board with only the cards it needs, plain words — no rule numbers or
engine terms. A second thing to check is a second test.

## Spells, copies and mana from unusual places (2026-10-03, first round)

### Feather: your spell on your creature returns at the end step
- **Do:** Cast Giant Growth on your Grizzly Bears and let it resolve. Pass to your end step.
- **Expect:** Giant Growth goes to exile, not your graveyard. At the beginning of your end step it returns to your hand.

### Feather: a countered spell isn't exiled
- **Do:** Cast Giant Growth on your Grizzly Bears, then Counterspell it yourself.
- **Expect:** Giant Growth goes to your graveyard and doesn't come back.
- **Not a bug:** Feather only exiles a spell that resolves.

### Feather: the spell still returns after Feather leaves
- **Do:** Cast Giant Growth on your Grizzly Bears. Once Feather's trigger has resolved, cast Unsummon on Feather. Pass to your end step.
- **Expect:** Giant Growth is still exiled as it resolves, and returns to your hand at the end step.

### Feather: choosing between two exile effects (Rest in Peace)
- **Do:** Cast Giant Growth on your Grizzly Bears (the opponent has Rest in Peace).
- **Expect:** A two-option prompt headed with the spell's name, not Feather's. "Apply Feather, the Redeemed's replacement first: exile it and return it to your hand at the beginning of the next end step" returns it at the end step; "Apply the other replacement first: exile it" leaves it exiled for good. Check the wording makes sense to someone who didn't write it.

### Feather: flashback spell, Feather's exile first
- **Do:** Flash back Defy Gravity from your graveyard onto your Grizzly Bears. At the two-option prompt, pick "Apply Feather, the Redeemed's replacement first…". Pass to your end step.
- **Expect:** The prompt is headed with Defy Gravity's name. Defy Gravity is exiled, then returns to your hand at the beginning of your end step.

### Feather: flashback spell, flashback's exile first
- **Do:** Flash back Defy Gravity from your graveyard onto your Grizzly Bears. At the two-option prompt, pick "Apply the other replacement first: exile it". Pass to your end step.
- **Expect:** Defy Gravity is exiled and stays there; it doesn't come back at the end step.

### Feather: Adventure spell, Feather's exile first
- **Do:** Cast Swift End (Murderous Rider's Adventure) on your own Grizzly Bears. At the two-option prompt, pick "Apply Feather, the Redeemed's replacement first…". Pass to your end step.
- **Expect:** Murderous Rider is exiled, then returns to your hand at the beginning of your end step.

### Feather: Adventure spell, on an adventure instead
- **Do:** Cast Swift End (Murderous Rider's Adventure) on your own Grizzly Bears. At the two-option prompt, pick "Exile it on an adventure instead". Then cast Murderous Rider from exile.
- **Expect:** The card sits in exile on an adventure, and Murderous Rider can be cast from there.

### Feather: a spell on an opponent's creature goes to the graveyard
- **Do:** Cast Giant Growth on the opponent's Grizzly Bears.
- **Expect:** Giant Growth goes to your graveyard as normal, with no prompt and no exile.

### Zada: one copy per other creature, in the order you pick
- **Do:** Cast Giant Growth on Zada. At the prompt, click your two Grizzly Bears one at a time.
- **Expect:** The prompt reads "Order the copies of Giant Growth: pick each target in turn — the copy for the first goes on the stack first, and resolves last". Only your two Bears can be clicked: not Argothian Enchantress (shroud), not the opponent's Bears, not Zada. The stack shows the copies in the order you clicked (first-clicked lowest), and each Bears ends 5/5, Zada 6/6.
- **Not a bug:** The copies aren't cast, so they don't trigger Zada again.

### Zada: only one other creature, no prompt
- **Do:** Cast Giant Growth on Zada.
- **Expect:** No ordering prompt: a copy is simply made for your Grizzly Bears.

### Zada: a spell on Zada and another creature isn't copied
- **Do:** Cast Seeds of Strength with targets Zada, Zada and one of your Grizzly Bears.
- **Expect:** Zada doesn't trigger and nothing is copied.

### Zada: all three targets on Zada copies the whole spell
- **Do:** Cast Seeds of Strength with all three targets on Zada.
- **Expect:** Zada triggers. Each copy targets one of your Grizzly Bears in all three slots.

### Zada: two tokens from one stack each get a copy
- **Do:** Cast Raise the Alarm, then cast Giant Growth on Zada. At the prompt, click both Soldier tokens.
- **Expect:** The two Soldiers sit on one stacked tile, but both can be clicked in the prompt and both end 4/4.
- **Not a bug:** The token stack may be split into separate tokens and stay split on the board afterwards.

### Zada: a countered spell is still copied
- **Do:** Cast Giant Growth on Zada. With Zada's trigger on the stack, Counterspell your Giant Growth (above the trigger).
- **Expect:** Zada's trigger still makes a copy for each of your Grizzly Bears, aimed by the countered spell's target.

### Ivy: copying an opponent's pump spell onto Ivy
- **Do:** Switch to Bob and cast Giant Growth on Bob's Grizzly Bears. Back as Alice, answer Yes.
- **Expect:** You're asked "Copy that spell? The copy targets Ivy." You control the copy, it resolves first, and Ivy gets +3/+3.

### Ivy: answering No makes no copy
- **Do:** Switch to Bob and cast Giant Growth on Bob's Grizzly Bears. Back as Alice, answer No.
- **Expect:** Nothing is copied; only Bob's Bears gets +3/+3.

### Ivy: copying a Shock kills her, so it's optional
- **Do:** Switch to Bob and cast Shock at your Grizzly Bears. Back as Alice, look at the prompt, then answer Yes.
- **Expect:** The same "Copy that spell? The copy targets Ivy." prompt appears, and No is easy to find. Answering Yes puts a Shock on Ivy and kills her.

### Ivy: no copy while she has shroud
- **Do:** Ivy wears Lightning Greaves. Switch to Bob and cast Giant Growth on Bob's Grizzly Bears; answer Yes if you're asked.
- **Expect:** No copy is made: Ivy isn't a legal target.

### Ivy: a spell on two different creatures doesn't trigger
- **Do:** Cast Seeds of Strength with targets Bears 1, Bears 2, Bears 1.
- **Expect:** Ivy doesn't trigger.

### Ivy: one creature in every slot is copied onto Ivy
- **Do:** Cast Seeds of Strength with all three targets on one of your Grizzly Bears. Answer Yes.
- **Expect:** Ivy triggers, and every target of the copy is Ivy: she ends 5/4, and the Bears gets +3/+3 from the original.

### Ivy: a spell aimed at Ivy herself doesn't trigger
- **Do:** Cast Giant Growth on Ivy.
- **Expect:** Ivy doesn't trigger.

### Ivy: a spell aimed at a player doesn't trigger
- **Do:** Cast Shock at Bob.
- **Expect:** Ivy doesn't trigger.

### Krark: a lost flip returns the spell to your hand
- **Do:** Cast Shock at the opponent's Grizzly Bears. Repeat until you lose a flip.
- **Expect:** Each cast flips a coin and the log says who won. On a lost flip, Shock returns to your hand, the Bears takes no damage, and you can cast the Shock again.
- **Not a bug:** The flip is random, so it may take a few casts.

### Krark: a won flip copies the spell with new targets
- **Do:** Cast Shock at the opponent's Grizzly Bears. Repeat until you win a flip.
- **Expect:** A copy is made with a choose-targets prompt that keeps the Bears by default; you can retarget to the opponent or another creature. The copy resolves first and doesn't flip again (it isn't cast).

### Krark: countered after a lost flip, the spell stays in the graveyard
- **Do:** Cast Shock at the opponent's Grizzly Bears and, before Krark's trigger resolves, Counterspell your Shock. Repeat until you lose a flip.
- **Expect:** On the lost flip nothing comes back: Shock stays in your graveyard.

### Krark: countered before a won flip, the copy is still made
- **Do:** Cast Shock at the opponent's Grizzly Bears and, before Krark's trigger resolves, Counterspell your Shock. Repeat until you win a flip.
- **Expect:** On the won flip the copy is still made, even though the Shock was countered.

### Dawn Charm: counters a spell that targets you
- **Do:** Switch to Bob and cast Shock at you. Back as Alice, cast Dawn Charm with its "counter target spell that targets you" mode.
- **Expect:** The Shock is offered as the target.

### Rebuff the Wicked: can't counter a spell aimed at you
- **Do:** Switch to Bob and cast Shock at you. Back as Alice, try to cast Rebuff the Wicked.
- **Expect:** Rebuff offers nothing to target.

### Rebuff the Wicked: counters a spell aimed at your creature
- **Do:** Switch to Bob and cast Shock at your Grizzly Bears. Back as Alice, cast Rebuff the Wicked.
- **Expect:** Rebuff offers the Shock as its target.

### Dawn Charm: can't counter a spell aimed at your creature
- **Do:** Switch to Bob and cast Shock at your Grizzly Bears. Back as Alice, cast Dawn Charm and pick its third mode.
- **Expect:** The third mode doesn't offer the Shock.

### Rebuff the Wicked: fails if the creature is blinked
- **Do:** Switch to Bob and cast Shock at your Grizzly Bears. Back as Alice, cast Rebuff on the Shock, then Cloudshift the Bears (above Rebuff).
- **Expect:** The Bears comes back as a new creature, so Rebuff doesn't resolve. The Shock then fizzles too.

### Season of Growth: a spell on your creature draws a card
- **Do:** Cast Giant Growth on your Grizzly Bears.
- **Expect:** You draw one card.

### Season of Growth: one spell at two of your creatures draws once
- **Do:** Cast Seeds of Strength with targets spread over both your Grizzly Bears.
- **Expect:** You draw only one card.

### Season of Growth: a spell on an opponent's creature draws nothing
- **Do:** Cast Giant Growth on the opponent's Grizzly Bears.
- **Expect:** You draw nothing.

### Season of Growth: two tokens entering give two scry 1s
- **Do:** Cast Raise the Alarm.
- **Expect:** Two separate scry 1 prompts, one card at a time.

### Sevinne's Reclamation: cast from hand, no copy
- **Do:** Cast Sevinne's Reclamation from your hand targeting Wall of Omens in your graveyard.
- **Expect:** Wall of Omens returns, and there's no copy prompt.

### Sevinne's Reclamation: flashback copies onto a new target
- **Do:** Flash back Sevinne's Reclamation ({4}{W}) targeting Wall of Omens. Answer Yes to the copy prompt and retarget the copy to Elvish Visionary.
- **Expect:** Wall returns, then "Copy Sevinne's Reclamation, and choose a new target for the copy?". The target prompt shows the Wall as the current target and offers your other mana value 3 or less permanent cards; Wall's draw resolves before the copy, then Visionary returns and draws. Only one copy is made, and Sevinne's ends in exile.

### Sevinne's Reclamation: a copy left on the old target does nothing
- **Do:** Flash back Sevinne's Reclamation targeting Wall of Omens. Answer Yes to the copy prompt but keep the Wall as the copy's target.
- **Expect:** The copy fizzles and nothing more returns.
- **Not a bug:** The Wall is already on the battlefield, so it's no longer a legal target.

### Glarb: your top card is face up to you only
- **Do:** Look at your library pile. Then Switch to Bob and look at your library from there.
- **Expect:** You see your top card face up, highlighted because you can cast it. From Bob's seat your library shows only a card back.

### Glarb: an X spell from the top needs X of 4 or more
- **Do:** Cast Stonecoil Serpent from the top of your library.
- **Expect:** The X prompt won't go below 4. It starts at the most X you can pay.

### Glarb: a big creature casts from the top like from hand
- **Do:** Cast Colossal Dreadmaw from the top of your library.
- **Expect:** It casts like from your hand, and the next card (a Forest) then shows on top.

### Glarb: a land on top uses your land drop
- **Do:** Play the Forest from the top of your library.
- **Expect:** It's played with your land drop, and only at sorcery timing.

### Glarb: a cheap spell on top can't be cast
- **Do:** Look at the Grizzly Bears on top of your library.
- **Expect:** It isn't highlighted and can't be cast (mana value 2).

### Thundermane Dragon: a big creature from the top has haste
- **Do:** Cast Craw Wurm from the top of your library, then attack with it.
- **Expect:** Craw Wurm (power 6) can be cast from the top and has haste: it can attack this turn.

### Thundermane Dragon: haste stays after the Dragon leaves
- **Do:** Cast Craw Wurm from the top of your library, then cast Unsummon on Thundermane Dragon. Attack with the Wurm.
- **Expect:** The Wurm still has haste and can attack.

### Thundermane Dragon: a small creature on top can't be cast
- **Do:** Look at the Grizzly Bears on top of your library.
- **Expect:** It can't be cast (power 2).

### Korlessa: a Dragon on top can be cast
- **Do:** Cast Shivan Dragon from the top of your library.
- **Expect:** It casts from the top.

### Korlessa: a non-Dragon on top can't be cast
- **Do:** Look at the Grizzly Bears on top of your library.
- **Expect:** It can't be cast: Korlessa allows Dragons only.

### Sigarda: a Human on top can be cast
- **Do:** Cast Akroan Jailer (a Human) from the top of your library.
- **Expect:** It casts from the top.

### Sigarda: your other permanents have hexproof
- **Do:** Switch to Bob and cast Swords to Plowshares.
- **Expect:** Your Grizzly Bears can't be targeted, but Sigarda herself can.

### Realmwalker: choose a type, then cast that type from the top
- **Do:** Cast Realmwalker and choose Bear. Then cast the Grizzly Bears from the top of your library.
- **Expect:** A creature type prompt appears as Realmwalker enters. The Grizzly Bears can be cast from the top.

### Realmwalker: a creature of another type can't be cast
- **Do:** Cast Realmwalker and choose Bear. Look at the Llanowar Elves on top of your library.
- **Expect:** Llanowar Elves can't be cast from the top.

### Realmwalker: a changeling on top can be cast
- **Do:** Cast Realmwalker and choose Bear. Cast the Changeling Outcast from the top of your library.
- **Expect:** It can be cast: a changeling is every creature type.

### Emperor Mihail II: paying {1} makes a Merfolk
- **Do:** Cast Coral Merfolk from the top of your library and answer Yes to the pay prompt.
- **Expect:** The prompt reads "Pay {1} to create a 1/1 blue Merfolk creature token?". Yes taps one more mana and makes the token.

### Emperor Mihail II: declining the {1} makes nothing
- **Do:** Cast Coral Merfolk from the top of your library and answer No to the pay prompt.
- **Expect:** No mana is spent and no token is made.

### Hakoda: an Ally on top can be cast
- **Do:** Cast Expedition Envoy (an Ally) from the top of your library.
- **Expect:** It casts from the top.

### Hakoda: sacrificing it protects your creatures
- **Do:** Sacrifice Hakoda.
- **Expect:** Your creatures get +0/+5 and indestructible (your Grizzly Bears becomes 2/7).

### Elven Chorus: your creatures tap for any colour
- **Do:** Tap your Grizzly Bears for mana.
- **Expect:** Your creatures have "{T}: Add one mana of any color".

### Crystal Skull: an artifact on top can be cast
- **Do:** Cast Sol Ring from the top of your library.
- **Expect:** It casts from the top.

### Crystal Skull: a legendary creature on top can be cast
- **Do:** Cast Krenko, Mob Boss from the top of your library.
- **Expect:** It casts from the top.

### Crystal Skull: a nonhistoric card on top can't be cast
- **Do:** Look at the Grizzly Bears on top of your library.
- **Expect:** It can't be cast: only artifacts and legendaries can.

### Mystic Forge: an artifact on top can be cast
- **Do:** Cast Sol Ring from the top of your library.
- **Expect:** It casts from the top.

### Mystic Forge: a colourless land on top can't be played
- **Do:** Look at the Wastes on top of your library.
- **Expect:** It can't be played: lands aren't cast.

### Mystic Forge: a coloured creature on top can't be cast
- **Do:** Look at the Grizzly Bears on top of your library.
- **Expect:** It can't be cast.

### Mystic Forge: pay 1 life to exile the top card
- **Do:** Activate Mystic Forge's {T}, Pay 1 life ability.
- **Expect:** The top card is exiled (watch for a card back flaring off the library pile), with no permission to play it.

### Gonti: one trigger exiles the top card face down
- **Do:** Attack with Gonti and Grizzly Bears and let both connect.
- **Expect:** Gonti triggers once for both. Bob's top card goes face down into Bob's exile pile, and you can see what it is.

### Gonti: the opponent sees only a face-down card
- **Do:** Attack with Gonti and Grizzly Bears and let both connect. Then Switch to Bob and open Bob's exile pile.
- **Expect:** Bob sees that there's a card, but not what it is.

### Gonti: cast the stolen card for {1} less with any mana
- **Do:** Attack with Gonti and Grizzly Bears. In your second main phase, open Bob's exile pile and cast the Craw Wurm.
- **Expect:** It's offered as "Cast (impulse)", costs {1} less, and your 5 Islands pay for it. It enters under your control.
- **Not a bug:** Nothing highlights an exile pile holding a card you can play, so it's easy to miss.

### Gonti: no discount on your own cards
- **Do:** Cast the Grizzly Bears from your hand.
- **Expect:** It costs its full {1}{G}.

### Gonti: Feather doesn't exile a spell you don't own
- **Do:** Attack with Gonti and Feather. In your second main phase, cast the stolen Giant Growth from Bob's exile pile on Gonti.
- **Expect:** Giant Growth goes to Bob's graveyard, not to exile.
- **Not a bug:** Feather only exiles spells you own.

### Outrageous Robbery: the cards are face down to everyone but you
- **Do:** Cast Outrageous Robbery with X = 2 targeting Bob. Open Bob's exile pile, then Switch to Bob and open it again.
- **Expect:** Two cards go face down into Bob's exile pile. You can see them; Bob can't.

### Outrageous Robbery: play the stolen land
- **Do:** It's Bob's end step: cast Outrageous Robbery with X = 2 targeting Bob. On your turn, open Bob's exile pile and play the Forest.
- **Expect:** The Forest is offered as "Play land" and uses your land drop (sorcery timing).

### Outrageous Robbery: cast the stolen creature with any mana
- **Do:** It's Bob's end step: cast Outrageous Robbery with X = 2 targeting Bob. On your turn, cast the Grizzly Bears from Bob's exile pile.
- **Expect:** Your Swamps pay for it.

### Outrageous Robbery: the cards stay playable on later turns
- **Do:** It's Bob's end step: cast Outrageous Robbery with X = 2 targeting Bob. Don't play the cards on your turn; check again on your next turn.
- **Expect:** Both cards are still exiled and still playable.

### Grenzo: the goad mode targets only that player's creatures
- **Do:** Attack Bob with Grizzly Bears. When it connects, pick the goad mode.
- **Expect:** A mode prompt appears when the trigger fires. Goad offers only creatures Bob controls.

### Grenzo: an exiled spell can be cast this turn with any colour
- **Do:** Attack Bob with Grizzly Bears. When it connects, pick the exile mode. In your second main phase, cast the exiled Grizzly Bears.
- **Expect:** The card is exiled face up and your Mountains pay for it.

### Grenzo: an exiled land can't be played
- **Do:** Attack Bob with Grizzly Bears. When it connects, pick the exile mode (Bob's top card is a Forest).
- **Expect:** The Forest can't be played.

### Grenzo: an uncast card loses its permission next turn
- **Do:** Attack Bob with Grizzly Bears, pick the exile mode, and don't cast the card. Pass to your next turn.
- **Expect:** The card stays in exile but can't be cast any more.

### Stolen Strategy: cast the stolen spell with off-colour mana
- **Do:** It's Bob's end step. Pass to your upkeep and let the trigger resolve, then cast the exiled Grizzly Bears.
- **Expect:** Bob's top card is exiled, and your Islands pay for the Bears.

### Stolen Strategy: a stolen land can't be played
- **Do:** It's Bob's end step. Pass to your upkeep and let the trigger resolve (Bob's top card is a Forest).
- **Expect:** The Forest can't be played.

### Stolen Strategy: an uncast card loses its permission next turn
- **Do:** It's Bob's end step. Pass to your upkeep and let the trigger resolve. Don't cast the card; pass to your next turn.
- **Expect:** The card stays exiled, with no permission to cast it.

### Laughing Jasper Flint: X is the number of outlaws you control
- **Do:** It's Bob's end step. Pass to your upkeep and let Jasper's trigger resolve. Cast what you can.
- **Expect:** The trigger targets an opponent and exiles Bob's top 2 cards (Jasper and Changeling Outcast are your outlaws). Spells among them can be cast this turn with your Islands; the Forest can't be played.

### Laughing Jasper Flint: a stolen creature is a Mercenary
- **Do:** Cast Act of Treason on Bob's Craw Wurm and look at its type line.
- **Expect:** The type line shows Mercenary (an outlaw).

### You Find Some Prisoners: pick one of three exiled cards
- **Do:** Cast it choosing Interrogate Them, targeting Bob. Choose the Grizzly Bears, then cast it.
- **Expect:** The mode choice shows both modes. All three cards are exiled, then "Choose a card you may play" shows exactly those three; the Bears can be cast off your Mountains. The other two stay in exile and can't be played.

### You Find Some Prisoners: a chosen land uses your land drop
- **Do:** Cast it choosing Interrogate Them, targeting Bob. Choose the Island, then play it.
- **Expect:** The Island is played with your land drop.

### You Find Some Prisoners: the card is playable through your next turn
- **Do:** Cast it choosing Interrogate Them, targeting Bob. Choose the Grizzly Bears but don't cast it. On your next turn, cast it.
- **Expect:** The Bears can still be cast on your next turn, off your Mountains.

### You Find Some Prisoners: unplayed, it's stuck after your next turn
- **Do:** Cast it choosing Interrogate Them, targeting Bob. Choose the Grizzly Bears and don't cast it this turn or next. Look again on the turn after.
- **Expect:** It stays in exile and can't be cast.

### Tinybones: the activation is sorcery speed only
- **Do:** It's your beginning of combat step. Try to activate Tinybones ({3}{B}, {T}).
- **Expect:** It can't be activated outside your main phase.

### Tinybones: the opponent chooses the discard
- **Do:** Activate Tinybones in your main phase. Switch to Bob to choose the discard.
- **Expect:** Bob is asked which card to discard (check the prompt is clear). The card goes to Bob's exile pile, with its stash counter showing in the zone viewer.

### Tinybones: each discarded card triggers separately
- **Do:** Cast Mind Rot on Bob.
- **Expect:** Each discarded card triggers on its own and goes to Bob's exile pile with a stash counter.

### Tinybones: cast a stashed card on your turn with any mana
- **Do:** Activate Tinybones (Bob discards his only card). Open Bob's exile pile and cast the Grizzly Bears.
- **Expect:** It's offered as "Cast (impulse)" and your Swamps pay for it.

### Tinybones: a stashed card can't be cast on the opponent's turn
- **Do:** Activate Tinybones (Bob discards his Lightning Bolt). Pass to Bob's turn and try to cast the Bolt from his exile pile.
- **Expect:** It can't be cast on Bob's turn.

### Kalamax: copies your first instant while tapped
- **Do:** Cast Shock at Bob (Kalamax is tapped).
- **Expect:** Kalamax copies it, with a prompt to choose new targets. It also gets a +1/+1 counter; that trigger resolves before the copy.

### Kalamax: your second instant isn't copied
- **Do:** Cast Shock at Bob, let everything resolve, then cast a second Shock.
- **Expect:** Only the first Shock is copied.

### Kalamax: no copy if it's untapped when the trigger resolves
- **Do:** Cast Shock at Bob. With Kalamax's trigger on the stack, cast Twiddle to untap Kalamax.
- **Expect:** When the trigger resolves, no copy is made.

### Stella Lee: your second spell exiles your top card to play
- **Do:** Cast Shock at Bob twice. Then open your exile pile.
- **Expect:** The second Shock triggers Stella and exiles your top card. It sits in your exile pile with a Cast/Play button, playable until the end of your next turn.

### Stella Lee: the copy ability needs three spells first
- **Do:** Cast Shock at Bob twice and try to tap Stella. Cast a third Shock and, with it on the stack, tap Stella targeting it.
- **Expect:** Stella's ability can't be activated after two spells, only after the third. Its copy offers new targets.

### Kalamax and Stella Lee: three Shocks and two copies
- **Do:** Cast three Shocks at Bob, one after another. With the third on the stack, tap Stella targeting it; keep every copy aimed at Bob.
- **Expect:** Kalamax copies only the first Shock. Stella's copy gives Kalamax a second +1/+1 counter. Bob ends at 10 life (from 20).

### Fire Lord Azula: a spell before combat isn't copied
- **Do:** Cast Lightning Bolt at Bob in your first main phase.
- **Expect:** No copy.

### Fire Lord Azula: a spell cast while she attacks is copied
- **Do:** Attack with Azula. In the declare blockers step, cast Lightning Bolt with the {R} from firebending.
- **Expect:** The Bolt is copied, with a prompt to choose new targets.

### Fire Lord Azula: copies in end of combat, firebending mana lasts
- **Do:** Attack with Azula and don't spend the {R}{R} from firebending. In the end of combat step, cast Lightning Bolt with it.
- **Expect:** The {R}{R} is still there to pay with, and the Bolt is copied: Azula is still attacking.

### Alania: the first instant is copied if an opponent draws
- **Do:** Cast Shock. Choose an opponent for Alania's trigger and answer Yes.
- **Expect:** You're asked which opponent as the trigger goes on the stack. Then "Have target opponent draw a card to copy that spell?". Yes: that opponent draws and you get a copy with new targets.

### Alania: the second instant isn't copied
- **Do:** Cast Shock and answer Yes. Then cast a second Shock.
- **Expect:** The second Shock doesn't trigger Alania.

### Alania: the first sorcery is copied
- **Do:** Cast Divination and answer Yes.
- **Expect:** Divination is copied.

### Alania: the first Otter is copied as a token
- **Do:** Cast Kindlespark Duo and answer Yes.
- **Expect:** Kindlespark Duo is copied, and the copy becomes a token.

### Alania: the second Otter isn't copied
- **Do:** Cast Kindlespark Duo and answer Yes. Then cast the second Kindlespark Duo.
- **Expect:** The second Duo doesn't trigger Alania.

### Alania: her own cast isn't the first Otter
- **Do:** Cast Alania from your hand, then cast Kindlespark Duo.
- **Expect:** The Duo triggers Alania and can be copied.

### Imodane: damage dealt, not toughness, goes to each opponent
- **Do:** Cast Lightning Bolt at one opponent's Grizzly Bears.
- **Expect:** Imodane deals 3 to each opponent: the damage the Bears was dealt, not its toughness of 2.

### Imodane: a spell split between two creatures doesn't trigger
- **Do:** Cast Fireball with X = 4, split between both opponents' Grizzly Bears.
- **Expect:** Imodane doesn't trigger.

### Imodane: a spell at a player doesn't trigger
- **Do:** Cast Shock at an opponent.
- **Expect:** Imodane doesn't trigger.

### Imodane: your own creature counts too
- **Do:** Cast Lightning Bolt at your own Grizzly Bears.
- **Expect:** Imodane deals 3 to each opponent.

### Reflections of Littjara: choosing a creature type
- **Do:** Cast Reflections of Littjara.
- **Expect:** As it enters you're asked for a creature type, from a searchable list of real creature types only (no card types).

### Reflections of Littjara: a spell of the chosen type is copied
- **Do:** Cast Reflections of Littjara choosing Bear, then cast Grizzly Bears.
- **Expect:** The Bears is copied and the copy becomes a token Grizzly Bears. The trigger and the copy resolve before the original.

### Reflections of Littjara: a changeling is copied
- **Do:** Cast Reflections of Littjara choosing Bear, then cast Changeling Outcast.
- **Expect:** It's copied: a changeling is every creature type.

### Reflections of Littjara: other spells aren't copied
- **Do:** Cast Reflections of Littjara choosing Bear, then cast Shock.
- **Expect:** Shock isn't copied.

### Volo: a creature with a new type is copied
- **Do:** Cast Grizzly Bears.
- **Expect:** It's copied into a token.

### Volo: a creature sharing a type with yours isn't copied
- **Do:** Cast the Grizzly Bears from your hand (one is already on your battlefield).
- **Expect:** It isn't copied: it shares Bear with the one you control.

### Volo: a changeling in your graveyard blocks every copy
- **Do:** Cast Craw Wurm (Changeling Outcast is in your graveyard).
- **Expect:** It isn't copied: the changeling shares every creature type.

### Vizier of the Menagerie: creature spells use any type of mana
- **Do:** Cast Grizzly Bears off your Mountains, then Glaring Fleshraker.
- **Expect:** Both are castable with Mountains, Fleshraker's {C} included.

### Vizier of the Menagerie: a noncreature spell still needs its colours
- **Do:** Look at Divination in your hand.
- **Expect:** It isn't castable off your Mountains: only creature spells get the help.

### Vizier of the Menagerie: only Murderous Rider's creature half
- **Do:** Look at Murderous Rider in your hand and cast what's offered.
- **Expect:** Only the creature face is offered, paid with your Forests. Swift End (an instant) isn't offered.

### Chromatic Orrery: Mountains pay for blue
- **Do:** Cast Divination using your Mountains.
- **Expect:** It's castable: your Mountains pay its blue.

### Chromatic Orrery: a {C} cost still needs colourless mana
- **Do:** Look at Glaring Fleshraker ({2}{C}) with only your Mountains untapped. Then play Wastes and cast it.
- **Expect:** It isn't castable off Mountains alone (any colour isn't colourless). Once the Wastes is out, it is.

### Chromatic Orrery: converge counts the colours actually spent
- **Do:** Cast Painful Truths off your 3 Mountains.
- **Expect:** You draw 1 card and lose 1 life: only red was spent.

### Grolnok: attacking mills three, permanent cards go to exile
- **Do:** Attack with Grolnok.
- **Expect:** You mill 3. Forest and Grizzly Bears each trigger separately and are exiled with a croak counter; Lightning Bolt stays in your graveyard.

### Grolnok: play lands and cast spells from croak exile
- **Do:** Attack with Grolnok. In your second main phase, open your exile pile, play the Forest and cast the Grizzly Bears.
- **Expect:** The Forest is offered as "Play land" and uses your land drop. The Bears casts at sorcery speed.

### Grolnok: Thought Scour's mill triggers it too
- **Do:** Cast Thought Scour targeting yourself.
- **Expect:** The milled Forest and Grizzly Bears are exiled with croak counters.

### Grolnok: croak cards can't be played without Grolnok
- **Do:** Attack with Grolnok. In your second main phase, Unsummon Grolnok and open your exile pile. Then recast Grolnok.
- **Expect:** With Grolnok gone the croak cards can't be played. Once Grolnok is back, they can.

### Pako: exiles every player's top card with a fetch counter
- **Do:** Attack with Pako.
- **Expect:** Your top card and Bob's are exiled with fetch counters. Pako gets +1/+1 for each noncreature card exiled (both, here).

### Haldan: cast an opponent's spell off any colour
- **Do:** Attack with Pako. In your second main phase, cast the Divination from Bob's exile pile.
- **Expect:** It's castable, paid with your Mountains.

### Haldan: play your own exiled land
- **Do:** Attack with Pako. In your second main phase, play the Forest from your exile pile.
- **Expect:** It's played with your land drop.

### Haldan: a creature card can't be cast
- **Do:** Attack with Pako. In your second main phase, look at the Grizzly Bears in Bob's exile pile.
- **Expect:** It can't be cast.

### Haldan: only Murderous Rider's Adventure is offered
- **Do:** Attack with Pako. In your second main phase, look at Murderous Rider in Bob's exile pile.
- **Expect:** Only Swift End (the noncreature half) is offered, paid with your Mountains.

### Pako: without Haldan nothing can be played
- **Do:** Attack with Pako. In your second main phase, look at both exile piles.
- **Expect:** Nothing is offered to play.

## Toxic, casualty, extra upkeeps and copy-on-enter (2026-10-03, first round)

### Cut Your Losses: casualty offers only power 2 or greater
- **Do:** Cast Cut Your Losses targeting Bob and read the casualty banner.
- **Expect:** The banner reads 'Casualty 2 — you may sacrifice a creature with power 2 or greater to copy Cut Your Losses — 0/1 chosen'. Only Grizzly Bears can be clicked, not Memnite.
- **Not a bug:** The banner appears after the spell is already on the stack.

### Cut Your Losses: paying casualty copies the spell
- **Do:** Cast Cut Your Losses targeting Bob. Pick Grizzly Bears and Confirm. Keep Bob as the copy's target.
- **Expect:** The Bears dies and a 'Casualty 2 — copy Cut Your Losses. You may choose new targets for the copy.' trigger sits above the spell. The copy mills 20 of Bob's 40 cards, then the original mills 10 more: 30 in all.

### Cut Your Losses: declining casualty makes no copy
- **Do:** Cast Cut Your Losses targeting Bob. Confirm with nothing picked.
- **Expect:** Nothing is sacrificed, no copy is made, and Bob mills 20.

### Cut Your Losses: no prompt without a big enough creature
- **Do:** Cast Cut Your Losses targeting Bob (your only creature is Memnite).
- **Expect:** No casualty prompt at all.

### Anhelo: two casualty prompts on one spell
- **Do:** Cast Lightning Bolt at Bob and read both casualty prompts.
- **Expect:** Two prompts: 'Casualty 2' from Anhelo and 'Casualty 1' from Silverquill. Casualty 2 offers Grizzly Bears, both Young Pyromancers and Silverquill, not Anhelo; Casualty 1 also offers Anhelo and Silverquill.
- **Not a bug:** The two prompts may come in either order.

### Silverquill: both copies aimed at a new target
- **Do:** Cast Lightning Bolt at Bob. Sacrifice one Young Pyromancer to one prompt and Grizzly Bears to the other. Aim each copy at Serra Angel.
- **Expect:** Two copy triggers, each asking for new targets. The Angel dies and Bob goes to 17. The sacrificed Pyromancer makes no Elemental, the other makes exactly one, and the copies make none.

### Silverquill: your second spell gets only Casualty 1
- **Do:** Cast Lightning Bolt at Bob and answer its prompts. Then cast a second Bolt.
- **Expect:** The second Bolt asks only 'Casualty 1': Anhelo covers just the first instant or sorcery each turn.

### Anhelo: Casualty 2 again on the opponent's turn
- **Do:** It's Bob's turn. Cast Lightning Bolt and answer the casualty prompts.
- **Expect:** Anhelo's 'Casualty 2' is offered (your first spell this turn). Once you answer, priority comes back to you, not to Bob.

### Anhelo: a spell cast before Anhelo still counts as the first
- **Do:** Cast Lightning Bolt at Bob, then cast Anhelo, then a second Bolt.
- **Expect:** The second Bolt gets no 'Casualty 2' prompt.

### Venerated Rotpriest: your own spell lets you pick the opponent
- **Do:** Cast Giant Growth on your Grizzly Bears.
- **Expect:** Rotpriest triggers and you choose the target opponent, Bob or Carol. You're never offered.

### Venerated Rotpriest: you aim it when an opponent's spell triggers it
- **Do:** Switch to Bob and cast Lightning Bolt at your Grizzly Bears. Back as Alice, aim the trigger at Carol.
- **Expect:** You can choose Carol. Carol's panel shows +1 poison.

### Venerated Rotpriest: an equip ability doesn't trigger it
- **Do:** Equip Swiftfoot Boots to your Grizzly Bears.
- **Expect:** No trigger: equip is an ability, not a spell.

### Mockingbird: copies a creature with mana value up to the mana spent
- **Do:** Cast Mockingbird with X = 2 and copy one of the offered creatures.
- **Expect:** Only creatures with mana value 3 or less can be clicked: both Grizzly Bears and Llanowar Elves, not Serra Angel or Mulldrifter. The copy is a Bird too and has flying.

### Mockingbird: copy nothing leaves a 1/1 flyer
- **Do:** Cast Mockingbird with X = 2 and choose 'Copy nothing'.
- **Expect:** It stays a 1/1 flyer.

### Deceptive Frostkite: copies your creatures with power 4 or more
- **Do:** Cast Giant Growth on your Grizzly Bears, then cast Deceptive Frostkite and copy the Bears.
- **Expect:** Only Serra Angel and the Giant-Grown Bears (5/5) can be clicked. The copy is a printed 2/2 Bears that is also a Dragon with flying.

### Malleable Impostor: copies only an opponent's creature
- **Do:** It's Bob's turn. Cast Malleable Impostor (it has flash) and copy Bob's Grizzly Bears.
- **Expect:** Only Bob's creatures can be clicked. The copy is also a Faerie Shapeshifter and has flying.

### Glasspool Mimic: copies only your own creature
- **Do:** Cast Glasspool Mimic and copy your Grizzly Bears.
- **Expect:** Only your creatures can be clicked. The copy is also a Shapeshifter Rogue.

### Glasspool Mimic: the land face asks nothing
- **Do:** Play Glasspool Mimic as its land, Glasspool Shore.
- **Expect:** Nothing is asked, and it enters tapped.

### Stunt Double: copies any creature and its enter trigger
- **Do:** Cast Stunt Double and copy Mulldrifter.
- **Expect:** Any creature, yours or Bob's, can be clicked. Mulldrifter's "when this enters, draw two" fires. The tile shows the copied name with '(copy)', and the log says it enters as a copy of Mulldrifter.

### Stunt Double: copy nothing leaves a 0/0
- **Do:** Cast Stunt Double and choose 'Copy nothing'.
- **Expect:** It enters as a 0/0 and dies.

### Phyrexian Metamorph: copies an artifact or creature from either side
- **Do:** Cast Phyrexian Metamorph, paying its {U/P} with 2 life. Read what can be clicked, then copy Sol Ring.
- **Expect:** The banner says 'click the permanent to copy'; artifacts and creatures, yours and Bob's, can be clicked. As a Sol Ring it's a noncreature artifact: it doesn't die as a 0/0, and it taps for {C}{C}.

### Clever Impersonator: copies a planeswalker with its printed loyalty
- **Do:** Cast Clever Impersonator and copy Bob's Nissa, Who Shakes the World (at 2 loyalty).
- **Expect:** Every nonland permanent, Bob's included, can be clicked. Your Nissa enters with 5 loyalty, not 2.

### Sculpting Steel: copies only artifacts
- **Do:** Cast Sculpting Steel and read what can be clicked.
- **Expect:** Only Sol Ring and Swiftfoot Boots, not Phyrexian Arena or Grizzly Bears.

### Copy Artifact: the copy is also an enchantment and colourless
- **Do:** Cast Copy Artifact and copy Sol Ring.
- **Expect:** It's an artifact enchantment, colourless (not blue).

### Masterwork of Ingenuity: an Equipment copy enters unattached
- **Do:** Cast Masterwork of Ingenuity and copy Swiftfoot Boots.
- **Expect:** It enters unattached and has equip {1}.

### Vesuva: copies any land and enters tapped
- **Do:** Play Vesuva and copy Bob's Mountain.
- **Expect:** Every land on the battlefield, both sides, can be clicked. It enters tapped as a Mountain.

### Vesuva: copy nothing enters untapped with no mana ability
- **Do:** Play Vesuva and choose 'Copy nothing'.
- **Expect:** It enters untapped as Vesuva, with no mana ability.

### Copy Enchantment: copying an Aura asks what it enchants
- **Do:** Cast Copy Enchantment and copy Pacifism. At the second prompt, choose Slippery Bogle.
- **Expect:** Two prompts in a row: first the copy choice (only Pacifism can be clicked), then 'choose what an Aura enchants'. Hexproof Slippery Bogle can be chosen; the copy enters attached and the Bogle can't attack or block.

### Mirrormade: copies an artifact or enchantment
- **Do:** Cast Mirrormade and read what can be clicked.
- **Expect:** Pacifism and Sol Ring can both be clicked.

### Estrid's Invocation: copies only your enchantments
- **Do:** Cast Estrid's Invocation and read what can be clicked. Copy your Phyrexian Arena.
- **Expect:** Only enchantments you control are offered, not Bob's Arena. It becomes a Phyrexian Arena with the Invocation's upkeep ability.

### Estrid's Invocation: the upkeep blink asks the copy again
- **Do:** Cast Estrid's Invocation copying Phyrexian Arena. At your next upkeep, order the triggers, then answer Yes to the Invocation's prompt.
- **Expect:** Two Arena triggers plus the Invocation's yes/no prompt. Yes exiles and returns it as a new object, which asks the copy choice again.

### Estrid's Invocation: copying nothing loses the upkeep ability
- **Do:** Cast Estrid's Invocation copying Phyrexian Arena. At your next upkeep answer Yes to its prompt, and choose 'Copy nothing' on the return.
- **Expect:** It's a plain Estrid's Invocation without the upkeep ability, and it can't copy itself to get it.

### Altered Ego: can't be countered
- **Do:** Cast Altered Ego with X = 2. Switch to Bob and try to Counterspell it. Back as Alice, copy Bob's Grizzly Bears.
- **Expect:** Counterspell can't target it, or does nothing. It enters as a Bears with 2 extra +1/+1 counters (4/4).

### Altered Ego: copy nothing gets no counters
- **Do:** Cast Altered Ego with X = 2 and choose 'Copy nothing'.
- **Expect:** It gets no counters and dies as a 0/0.

### Ghalta and Mavren: the Dinosaur's size is read on resolution
- **Do:** Attack with all three. Pick the Dinosaur mode, then with the trigger on the stack, cast Swords to Plowshares on your Serra Angel.
- **Expect:** The Dinosaur token is 2/2 (the Bears' power), not 4/4.

### Ghalta and Mavren: the Dinosaur attacks a player you choose
- **Do:** Attack Bob with all three and pick the Dinosaur mode. When the token enters, choose Carol.
- **Expect:** The token enters tapped and attacking, and you're asked which player or planeswalker it attacks. It can attack Carol even though the others attack Bob.

### Ghalta and Mavren: one Vampire per other attacker
- **Do:** Attack with all three and pick the Vampire mode.
- **Expect:** You get two 1/1 lifelink Vampires, one per other attacker, and they aren't attacking.

### Ghalta and Mavren: attacking alone makes a 0/0 Dinosaur
- **Do:** Attack with Ghalta and Mavren alone and pick the Dinosaur mode.
- **Expect:** The token is a 0/0 and dies at once.

### Auton Soldier: a nonlegendary artifact copy with myriad
- **Do:** Cast Auton Soldier and copy Krenko, Mob Boss.
- **Expect:** It's a nonlegendary artifact Krenko with myriad, and both Krenkos stay.

### Auton Soldier: myriad copies attack the other opponents
- **Do:** Cast Auton Soldier copying Krenko, Mob Boss. On your next turn, attack Bob with it.
- **Expect:** A myriad 'create a token copy attacking this player?' prompt, for Carol only. The token is a nonlegendary artifact Krenko and is exiled at end of combat.

### Karumonix: the enters look offers only Rats
- **Do:** Cast Karumonix and resolve its enters trigger.
- **Expect:** Only the two Blightbelly Rat cards can be taken (Bilious Skulldweller is an Insect), any number including none. The rest go to the bottom in random order.

### Karumonix: granted toxic adds to a Rat's own
- **Do:** Attack Bob with Blightbelly Rat.
- **Expect:** It deals 2 damage and gives 2 poison (its own toxic 1 plus Karumonix's). Bob's panel shows '2/10'.
- **Not a bug:** The Rat's tile shows only its printed 'Toxic 1'.

### Bilious Skulldweller: a blocked attacker gives no poison
- **Do:** Attack Bob with Bilious Skulldweller. Switch to Bob and block with Grizzly Bears.
- **Expect:** Bob gets no poison: damage to a creature never gives any.

### Blightbelly Rat: dying proliferates poison
- **Do:** Cast Lightning Bolt on your Blightbelly Rat. At the proliferate prompt, choose Bob.
- **Expect:** Bob goes from 1 to 2 poison.

### Contaminant Grafter: toxic from trample, then two proliferates
- **Do:** Attack with both creatures. Switch to Bob and block Contaminant Grafter with Grizzly Bears. Assign 2 to the Bears and 3 to Bob. Choose Bob at each proliferate.
- **Expect:** Bob goes from 1 to 3 poison and still loses the life. Two triggers follow (Bloated Contaminator's, and one from Grafter for the whole damage event): order them, and the two proliferates take Bob to 5.

### Contaminant Grafter: corrupted end-step draw and land
- **Do:** Pass to your end step (Bob has 3 poison).
- **Expect:** You draw a card, then get an optional prompt to put a land card from your hand onto the battlefield, which you can decline.

### Contaminant Grafter: no end-step trigger under 3 poison
- **Do:** Pass to your end step (Bob has 2 poison).
- **Expect:** Grafter doesn't trigger.

### Tyrranax Rex: toxic 4 gives exactly 4 poison
- **Do:** Attack Bob with Tyrranax Rex.
- **Expect:** Bob gets exactly 4 poison, however much damage it deals.

### Bloodroot Apothecary: you and an opponent each get a Treasure
- **Do:** Cast Bloodroot Apothecary and choose the target opponent.
- **Expect:** You're asked for a target opponent. You and that opponent each get one Treasure, made together.

### Bloodroot Apothecary: an opponent's Treasure gives them 2 poison
- **Do:** Switch to Bob and cast Grizzly Bears, paying with the Forest and the Treasure.
- **Expect:** Bob gets 2 poison after paying, even though the Treasure was sacrificed for mana.

### Bloodroot Apothecary: your own Treasure gives nothing
- **Do:** Sacrifice your Treasure for mana.
- **Expect:** Nobody gets poison.

### Bloodroot Apothecary: a creature token gives nothing
- **Do:** Switch to Bob and sacrifice the Soldier token to Viscera Seer.
- **Expect:** Bob gets no poison: the token is a creature.

### Bloodroot Apothecary: toxic 2 in combat
- **Do:** Attack Bob with Bloodroot Apothecary.
- **Expect:** Bob gets 2 poison.

### Mirrex: any colour only on the turn it enters
- **Do:** Play Mirrex and look at its mana abilities. Pass to your next turn and look again.
- **Expect:** On the turn it entered it offers 'Add one mana of any color'. On later turns it offers only {C}.

### White Sun's Twilight: X = 5 spares only the new Mites
- **Do:** Cast White Sun's Twilight with X = 5.
- **Expect:** You gain 5 life and get five new Mites. Grizzly Bears, Serra Angel and the older Mite die; none of the five new Mites do (they mustn't join the old Mite's stack).

### White Sun's Twilight: X = 4 destroys nothing
- **Do:** Cast White Sun's Twilight with X = 4.
- **Expect:** Nothing is destroyed.

### Phyrexian Mite: can't block
- **Do:** Switch to Bob and attack you with Grizzly Bears. Back as Alice, try to block with your Mite.
- **Expect:** The Mite isn't offered as a blocker.

### Phyrexian Mite: combat damage gives 1 poison
- **Do:** Attack Bob with your Mite.
- **Expect:** Bob gets 1 poison.

### Obeka: combat damage adds that many upkeeps
- **Do:** Attack with Obeka. Let damage and the trigger resolve, then step on to your second main phase.
- **Expect:** Obeka deals 2. After end of combat the phase track goes to UP twice, then to M2. No untap or draw step, and the turn number doesn't change.
- **Not a bug:** Nothing marks the upkeeps as extra; the track simply lights UP between EC and M2.

### Obeka: Phyrexian Arena triggers in each extra upkeep
- **Do:** Attack with Obeka and step through the extra upkeeps.
- **Expect:** Arena triggers in each one: +2 cards and -2 life in total.

### Obeka: a suspended spell comes off in an extra upkeep
- **Do:** Suspend Rift Bolt for {R}. Attack with Obeka and step into the first extra upkeep.
- **Expect:** Rift Bolt's last time counter comes off and you're asked for a target for its free cast (3 damage).

### Obeka: more damage, more upkeeps
- **Do:** Attack with Obeka. After blockers, cast Giant Growth on it.
- **Expect:** Obeka deals 5, and you get 5 extra upkeeps.

### Spark Double: a creature copy isn't legendary and gets a counter
- **Do:** Cast Spark Double and copy Krenko, Mob Boss.
- **Expect:** It isn't legendary and enters with one +1/+1 counter. Both Krenkos stay, with no legend prompt.

### Spark Double: a planeswalker copy gets one more loyalty
- **Do:** Cast Spark Double and copy your Nissa, Who Shakes the World.
- **Expect:** It has 6 loyalty (printed 5 plus 1) and isn't legendary. Both Nissas stay.

### Spark Double: Doubling Season doubles the counter
- **Do:** Cast Spark Double and copy Krenko, Mob Boss.
- **Expect:** It enters with two +1/+1 counters.

### Clone: a copy of a legend triggers the legend rule
- **Do:** Cast Clone and copy Krenko, Mob Boss.
- **Expect:** The copy is legendary, so the 'choose which legend to keep' prompt appears, with a 'Keep the oldest' button.

### Sakashima of a Thousand Faces: copies only your other creatures
- **Do:** Cast Sakashima of a Thousand Faces and read what can be clicked.
- **Expect:** Only your other creatures: not Sakashima itself, not Bob's Grizzly Bears.

### Sakashima of a Thousand Faces: your legends ignore the legend rule
- **Do:** Cast Sakashima copying Krenko, Mob Boss. Then cast Clone copying Krenko.
- **Expect:** Sakashima-as-Krenko is legendary but has 'the legend rule doesn't apply to permanents you control'. You keep all three Krenkos with no prompt.

### Sakashima of a Thousand Faces: the legend rule returns when it leaves
- **Do:** Cast Sakashima copying Krenko, Mob Boss, then Clone copying Krenko. Cast Lightning Bolt on Sakashima.
- **Expect:** As soon as Sakashima leaves, you're prompted to keep one of the remaining Krenkos, with no chance to respond.

### Sakashima the Impostor: keeps its own name and gains a return ability
- **Do:** Cast Sakashima the Impostor copying Grizzly Bears. Activate its {2}{U}{U} ability and pass to your end step.
- **Expect:** A legendary 2/2 named 'Sakashima the Impostor' (the tile shows that name with '(copy)' and the Bears art). At the beginning of the end step it returns to your hand.

### Sakashima the Impostor: two copies share a name and the legend rule
- **Do:** Cast one Sakashima the Impostor copying Grizzly Bears, then the other copying Serra Angel.
- **Expect:** Both are legendary 'Sakashima the Impostor', so the legend rule prompt appears.

### Sakashima the Impostor: a new object doesn't return
- **Do:** Cast Sakashima the Impostor copying Grizzly Bears and activate its {2}{U}{U} ability. Unsummon it, recast it, and pass to your end step.
- **Expect:** The delayed trigger does nothing: the recast Sakashima stays on the battlefield.

### Sakashima the Impostor: copy nothing is a plain 3/1
- **Do:** Cast Sakashima the Impostor and choose 'Copy nothing'.
- **Expect:** A plain 3/1 Human Rogue with no return ability.

### Phantasmal Image: targeted by an ability, it's sacrificed
- **Do:** Cast Phantasmal Image copying Serra Angel. Then equip Swiftfoot Boots to it.
- **Expect:** The Image is a 4/4 flying Angel Illusion. When the equip targets it, its trigger sacrifices it and the equip fizzles.

### Clone: a copy of Phantasmal Image is an Illusion too
- **Do:** Cast Phantasmal Image copying Serra Angel, then Clone copying the Image. Cast Giant Growth on the Clone.
- **Expect:** The Clone is also an Illusion with the sacrifice trigger. Giant Growth sacrifices the Clone, not the Image.

### Phantasmal Image: an opponent's spell sacrifices it too
- **Do:** Cast Phantasmal Image copying Serra Angel. Switch to Bob and cast Lightning Bolt at the Image.
- **Expect:** The Image is sacrificed as it becomes the target.

### Phantasmal Image: copy nothing is a 0/0 that dies
- **Do:** Cast Phantasmal Image and choose 'Copy nothing'.
- **Expect:** It's a 0/0 Illusion with no trigger, and it dies.

### Cursed Mirror: a hasty copy that can attack at once
- **Do:** Cast Cursed Mirror copying Bob's Serra Angel. Look at its abilities, then attack with it.
- **Expect:** It's a 4/4 flying, vigilance Angel with haste and can attack this turn. While it's a copy it has no '{T}: Add {R}'.

### Cursed Mirror: back to an artifact after the turn
- **Do:** Cast Cursed Mirror copying Bob's Serra Angel. Pass to Bob's turn.
- **Expect:** In the cleanup step it becomes Cursed Mirror again: an artifact that taps for {R}, not a creature.

### Clone: a copy of Cursed Mirror stays an Angel
- **Do:** Cast Cursed Mirror copying Bob's Serra Angel, then Clone copying the Mirror. Pass to Bob's turn.
- **Expect:** After cleanup the Clone is still a Serra Angel with haste; only the Mirror changes back.

### Aeve: storm copies count the Oozes already there
- **Do:** Cast two Lightning Bolts at Bob, then cast Aeve. Resolve everything.
- **Expect:** The copies resolve one at a time before the card: the first token enters as a 2/2, the second as 3/3, and the card Aeve as 4/4. The tokens aren't legendary, so there's no legend prompt; the card Aeve is legendary.

### Clone: a copy of an Aeve token is legendary
- **Do:** Cast two Lightning Bolts at Bob, then cast Aeve and resolve everything. Cast Clone copying one of the Aeve tokens.
- **Expect:** The Clone isn't a token, so it's legendary: the legend rule prompt appears for it and the card Aeve.

### Prime Speaker Zegana: counters from your creatures only
- **Do:** Cast Prime Speaker Zegana.
- **Expect:** It enters with 2 +1/+1 counters, from your Grizzly Bears: not Bob's Serra Angel (power 4), not itself. It's a 3/3.

### Prime Speaker Zegana: the draw uses its last power
- **Do:** Cast Prime Speaker Zegana. With its draw trigger on the stack, cast Lightning Bolt on it.
- **Expect:** Zegana dies, and you still draw 3.

### Tangleweave Armor: counts a commander in the command zone
- **Do:** Cast Tangleweave Armor (Krenko, Mob Boss is in your command zone).
- **Expect:** The Germ is a 4/4.

### Tangleweave Armor: moved to another creature
- **Do:** Cast Tangleweave Armor, then pay equip {4} to move it to your Grizzly Bears.
- **Expect:** The Bears is 6/6, and the unequipped 0/0 Germ dies.

### Tangleweave Armor: with no commander the Germ dies
- **Do:** Cast Tangleweave Armor.
- **Expect:** X is 0, so the Germ dies at once.

## Sacrifice costs and the Tarkir precons' one-offs (2026-10-03, second round)

### Sai, Master Thopterist: casting an artifact makes a Thopter
- **Do:** Cast Ornithopter.
- **Expect:** Sai triggers and a 1/1 flying Thopter token appears. The trigger resolves before Ornithopter does.

### Sai, Master Thopterist: sacrifice two artifacts, mana paid first
- **Do:** Activate Sai's '{1}{U}, Sacrifice two artifacts' and pick two artifacts in the sacrifice prompt.
- **Expect:** The mana is paid first and the ability goes on the stack, and only then does 'Sai, Master Thopterist: Sacrifice 2 - 0/2 chosen' appear. Sai isn't offered. Confirm stays disabled until exactly 2 are chosen, both leave together, you get priority back with the ability on the stack, and you draw 1 when it resolves.
- **Not a bug:** The sacrifice prompt has no Cancel: the mana is already paid.

### Sai, Master Thopterist: take two from a stacked token tile
- **Do:** Activate Sai's '{1}{U}, Sacrifice two artifacts'. In the sacrifice prompt, click the stacked Thopter tile and take 2 with the count menu.
- **Expect:** The stack's count drops by exactly 2 and the rest stay.

### Sai, Master Thopterist: a Treasure that pays can't also be sacrificed
- **Do:** Look at Sai's abilities (you have one Island and two Treasures).
- **Expect:** The '{1}{U}, Sacrifice two artifacts' ability isn't offered: the {1} has to come from a Treasure, which then can't also be sacrificed.

### Sai, Master Thopterist: exactly enough artifacts means no prompt
- **Do:** Activate Sai's '{1}{U}, Sacrifice two artifacts' (you have one Island and three Treasures).
- **Expect:** It's offered now. One Treasure pays the {1}, and the other Treasures are all sacrificed with no prompt.

### Jarad, Golgari Lich Lord: returning asks once per land type
- **Do:** Activate Jarad's 'Sacrifice a Swamp and a Forest' from your graveyard.
- **Expect:** Two 'Sacrifice 1' prompts. The first offers only the two Overgrown Tombs (the Forest can't be the Swamp); the second offers the other Tomb or the Forest. Jarad returns to your hand. Note whether you can tell which land type each prompt wants: it only says 'Sacrifice 1' and relies on the highlighting.

### Jarad, Golgari Lich Lord: one Overgrown Tomb can't be both lands
- **Do:** Try to activate Jarad's 'Sacrifice a Swamp and a Forest' from your graveyard (your only land is one Overgrown Tomb).
- **Expect:** You can't: a single Overgrown Tomb can't pay for both the Swamp and the Forest.

### Jarad, Golgari Lich Lord: a Tomb and a Swamp need no prompt
- **Do:** Activate Jarad's 'Sacrifice a Swamp and a Forest' from your graveyard (you have one Overgrown Tomb and one Swamp).
- **Expect:** Both lands are sacrificed with no prompt, and Jarad returns to your hand.

### Jarad, Golgari Lich Lord: the drain uses the pumped power
- **Do:** Note Jarad's size. Cast Giant Growth on Hill Giant, then activate Jarad's '{1}{B}{G}, Sacrifice another creature' and sacrifice Hill Giant.
- **Expect:** Before you start, Jarad is 4/4 (two creature cards in your graveyard). The opponent loses 6: the Giant's power as it last was, with Giant Growth.

### Metalwork Colossus: cheaper for each noncreature artifact
- **Do:** Look at Metalwork Colossus in your hand and cast it.
- **Expect:** It costs {11} minus 3: Sol Ring counts 1 and Mind Stone 2. Ornithopter, a creature, doesn't count.

### Metalwork Colossus: sacrifice two artifacts to return it
- **Do:** Activate the 'Sacrifice two artifacts' ability of the Metalwork Colossus in your graveyard.
- **Expect:** The Colossus returns to your hand.

### Priest of Forgotten Gods: targets sacrifice in turn order
- **Do:** It's Bob's turn. Activate Priest, targeting Carol first and then Bob, and choose two of your other creatures to sacrifice.
- **Expect:** Priest itself is never offered for the sacrifice. Bob and Carol each lose 2 life and sacrifice a creature: Bob chooses first (it's his turn), then Carol, whatever order you targeted them in.
- **Not a bug:** Bob and Carol are bots, so you only see their choices land in the log and on the board.

### Priest of Forgotten Gods: a target with no creatures still loses 2
- **Do:** It's Bob's turn. Activate Priest targeting Bob, who has no creatures, and sacrifice two of your other creatures.
- **Expect:** Bob loses 2 life and sacrifices nothing.

### Priest of Forgotten Gods: no targets still gives {B}{B} and a card
- **Do:** It's Bob's turn. Activate Priest, press 'Done' with no targets chosen, and sacrifice two of your other creatures.
- **Expect:** That's allowed, and the ability goes on the stack even with no targets. When it resolves, {B}{B} shows in your mana pool and you draw a card. The {B}{B} empties at the end of the step.

### Priest of Forgotten Gods: targeting yourself
- **Do:** Activate Priest targeting only yourself, and sacrifice two of your other creatures.
- **Expect:** You lose 2 life and choose a creature of your own to sacrifice as well.

### Grim Hireling: X goes up to 3 with a Swamp
- **Do:** Activate Grim Hireling's ability, choose X = 2 in the X prompt, target Hill Giant, then pick 2 Treasures.
- **Expect:** The X prompt goes up to 3. Hill Giant becomes 1/1.

### Grim Hireling: without a Swamp X goes up to 2
- **Do:** Activate Grim Hireling's ability (you have no Swamp, only three Treasures) and look at the X prompt.
- **Expect:** X goes up to 2: the {B} must come from a Treasure, which then can't also be sacrificed.

### Grim Hireling: X = 0 sacrifices nothing
- **Do:** Activate Grim Hireling's ability with X = 0, targeting Hill Giant.
- **Expect:** No sacrifice prompt appears and nothing is sacrificed.

### Grim Hireling: sorcery speed only
- **Do:** It's Bob's turn. When you get priority, try to activate Grim Hireling's ability.
- **Expect:** It isn't offered: it can only be activated at sorcery speed.

### Grim Hireling: two creatures connecting make 2 Treasures
- **Do:** Attack with Grim Hireling and Grizzly Bears and let both deal combat damage to the opponent.
- **Expect:** Exactly 2 Treasures, once, not 4.

### Magda, Brazen Outlaw: other Dwarves get +1/+0
- **Do:** Look at Axgard Cavalry and Magda.
- **Expect:** Axgard Cavalry is 3/2 (+1/+0). Magda isn't pumped by her own ability.

### Magda, Brazen Outlaw: a Dwarf becoming tapped makes a Treasure
- **Do:** Activate Axgard Cavalry's {T} ability, targeting Magda.
- **Expect:** Axgard Cavalry becoming tapped makes a Treasure.

### Magda, Brazen Outlaw: five Treasures fetch an artifact or Dragon
- **Do:** Activate Magda's 'Sacrifice five Treasures' and pick Shivan Dragon in the library search.
- **Expect:** Exactly 5 Treasures go with no prompt. The search offers only artifacts and Dragons (Sol Ring, Shivan Dragon). Shivan Dragon goes onto the battlefield and your library is shuffled.

### Magda, Brazen Outlaw: the search needs five Treasures
- **Do:** Look at Magda's abilities (you have four Treasures).
- **Expect:** 'Sacrifice five Treasures' isn't offered.

### Ruthless Technomancer: Treasures equal to a pumped creature's power
- **Do:** Cast Giant Growth on Hill Giant, then cast Ruthless Technomancer. Answer Yes to its question and sacrifice Hill Giant.
- **Expect:** The question reads roughly 'Sacrifice another creature to create Treasures equal to its power? Yes/No'. Technomancer itself isn't offered. You get 6 Treasures: Hill Giant's power as it last was, with Giant Growth.

### Ruthless Technomancer: answering No does nothing
- **Do:** Cast Ruthless Technomancer and answer No.
- **Expect:** Nothing is sacrificed and no Treasures are made.

### Ruthless Technomancer: each X brings back power X or less
- **Do:** Open Ruthless Technomancer's ability menu and pick the X = 2 offer. Then pick 2 artifacts to sacrifice.
- **Expect:** There is one offer for each X (1, 2, ...) and none for X = 0. At X = 2 only Grizzly Bears and Ornithopter are offered, not Hill Giant. Note whether you can tell the offers apart: the rows may look identical, with nothing saying which X is which.

### Stormshriek Feral: an Omen card offers both halves
- **Do:** Click each Omen card in your hand (Stormshriek Feral, Marang River Regent, Whirlwing Stormbrood, Bloomvine Regent) and look at the cast options.
- **Expect:** Each one offers both halves. The Omen half is cast with its own cost and colour: Dynamic Soar is green, {2}{G}.

### Flush Out: discard, draw two, shuffled into your library
- **Do:** Cast Flush Out (Stormshriek Feral's Omen half) and discard Lightning Bolt.
- **Expect:** You draw 2. Flush Out is shuffled into your library, not put in your graveyard, and the log shows a shuffle.

### Flush Out: an empty hand draws nothing
- **Do:** Cast Flush Out (Stormshriek Feral's Omen half) with nothing else in your hand.
- **Expect:** You draw nothing: it draws only if you discarded.

### Coil and Catch: a Twincast copy, then the original
- **Do:** Cast Coil and Catch (Marang River Regent's Omen half), copy it with Twincast, and let both resolve.
- **Expect:** The copy draws 3 and discards 1, then stops existing, and your library is still shuffled. Then the original resolves and is shuffled into your library.

### Flush Out: a countered Omen goes to the graveyard
- **Do:** Cast Flush Out (Stormshriek Feral's Omen half) and counter it with your own Counterspell.
- **Expect:** Stormshriek Feral goes to your graveyard, not into your library.

### Dynamic Soar: an Omen with no target left goes to the graveyard
- **Do:** Cast Dynamic Soar (Whirlwing Stormbrood's Omen half) on your Grizzly Bears. In response, cast Run Away Together on your Bears and the opponent's Hill Giant.
- **Expect:** Run Away Together returns both creatures. Dynamic Soar then has no target and goes to your graveyard.

### Claim Territory: two Forests, one tapped and one to hand
- **Do:** Cast Claim Territory (Bloomvine Regent's Omen half) and pick both basic Forests.
- **Expect:** One Forest goes onto the battlefield tapped and the other to your hand. Then your library is shuffled, with the Omen card itself shuffled in.

### Bloomvine Regent: the Library page shows the Omen
- **Do:** Open the Library page and find Bloomvine Regent.
- **Expect:** The Omen shows under an 'Omen' divider, isn't flippable, and has an 'omen' chip.

### Glorybringer: exert hits only an opponent's non-Dragon
- **Do:** Attack with Glorybringer. Answer Yes to the exert question.
- **Expect:** After attackers are declared and before blockers: 'Glorybringer - Exert Glorybringer as it attacks (it won't untap during your next untap step) [Yes] [No]'. Its trigger offers only the opponent's non-Dragon creatures (Grizzly Bears, Hill Giant), not Stormbreath Dragon and nothing of yours, and deals 4. The log reads 'Alice exerts Glorybringer'.

### Glorybringer: one legal target is chosen for you
- **Do:** Attack with Glorybringer and exert it (the opponent has Grizzly Bears and Stormbreath Dragon).
- **Expect:** The Bears are chosen for you with no target prompt, and take 4.

### Glorybringer: exert with only a Dragon to hit
- **Do:** Attack with Glorybringer and exert it (the opponent has only Stormbreath Dragon).
- **Expect:** You can still exert. The damage trigger just doesn't happen.

### Combat Celebrant: exert untaps the others and adds a combat
- **Do:** Attack with Glorybringer, Combat Celebrant and Grizzly Bears. Answer No for Glorybringer and Yes for Combat Celebrant.
- **Expect:** You're asked once for each attacker that can exert (Glorybringer and Combat Celebrant), not for the Bears. Celebrant's exert untaps all your other creatures, which stay attacking. A second combat follows right after this one, with no main phase between.

### Glorybringer: exerts again in the extra combat
- **Do:** Attack with all three and exert both Glorybringer (hit the Bears) and Combat Celebrant. In the extra combat, attack with Glorybringer and Grizzly Bears.
- **Expect:** Glorybringer is asked to exert again and can deal 4 again (to Hill Giant).

### Glorybringer: an exerted creature skips your next untap
- **Do:** Attack with Glorybringer and exert it. Play on to your next turn, then the turn after.
- **Expect:** In your next untap step Glorybringer stays tapped. The turn after, it untaps.
- **Not a bug:** No badge on the tile shows it's exerted; only the log does.

### Skarrgan Hellkite: riot asks before it enters
- **Do:** Cast Skarrgan Hellkite and pick 'Haste'. Look at its abilities.
- **Expect:** 'Skarrgan Hellkite - choose one [+1/+1 counter] [Haste]' appears before it enters, with no chance to respond. It has haste, and with no counter its damage ability can't be activated.

### Skarrgan Hellkite: riot's haste lasts
- **Do:** Cast Skarrgan Hellkite, pick 'Haste', and pass to your next turn.
- **Expect:** It still has haste.

### Skarrgan Hellkite: the counter instead of haste
- **Do:** Cast Skarrgan Hellkite and pick '+1/+1 counter'.
- **Expect:** It's 5/5 with no haste, and its '{3}{R}: 2 damage divided among one or two targets' can be activated.

### Skarrgan Hellkite: one target takes all 2
- **Do:** Activate the Hellkite's '{3}{R}: 2 damage divided among one or two targets' with one Grizzly Bears as the only target.
- **Expect:** That Bears takes 2, with no division step.

### Skarrgan Hellkite: two targets split 1 and 1
- **Do:** Activate the Hellkite's damage ability targeting one Grizzly Bears and the opponent.
- **Expect:** A 'Divide 2 damage' step opens as you activate (not when it resolves), forced to 1 and 1.
- **Not a bug:** The division step's confirm button says 'Cast' even for an ability.

### Skarrgan Hellkite: a target lost in response keeps its share
- **Do:** Activate the Hellkite's damage ability targeting one Grizzly Bears and the opponent, split 1 and 1. In response, Lightning Bolt that Bears.
- **Expect:** The opponent still takes only 1.

### Dragonlord Atarka: targets only opponents' creatures and planeswalkers
- **Do:** Cast Dragonlord Atarka and look at what its enters trigger can target.
- **Expect:** It offers creatures and planeswalkers of every opponent (Bob's Grizzly Bears, Hill Giant and Nissa; Carol's Craw Wurm). Never your Grizzly Bears, and never a player.

### Dragonlord Atarka: divide 5 between two creatures
- **Do:** Cast Dragonlord Atarka, target Grizzly Bears and Hill Giant, and divide 2 and 3.
- **Expect:** A division step follows the targets: at least 1 each, exactly 5 in total. 2 and 3 kills both.
- **Not a bug:** The confirm button reads 'Cast' even for a trigger.

### Dragonlord Atarka: a lopsided split lands as assigned
- **Do:** Cast Dragonlord Atarka, target Hill Giant and Grizzly Bears, and assign 4 to the Giant and 1 to the Bears.
- **Expect:** Hill Giant takes 4 and the Bears take 1.

### Dragonlord Atarka: one target takes all 5
- **Do:** Cast Dragonlord Atarka and target only Hill Giant.
- **Expect:** It takes all 5 with no division step.

### Dragonlord Atarka: a target lost in response loses its share
- **Do:** Cast Dragonlord Atarka, target Grizzly Bears and Hill Giant, divide 2 and 3. Before the trigger resolves, Lightning Bolt the Bears.
- **Expect:** Hill Giant takes only its 3; the Bears' 2 is lost.

### Inferno Titan: its attack trigger divides 3 among 1 to 3 targets
- **Do:** Attack with Inferno Titan and divide 3 among targets, including a player and a creature of your own.
- **Expect:** It takes 1 to 3 targets of any kind, yours included. 3 splits as 1/1/1, 2/1 or 3.

### Inferno Titan: Cancel in the division step
- **Do:** Attack with Inferno Titan, choose two targets, then press Cancel in the division step.
- **Expect:** You go back to choosing targets. The decision doesn't get stuck and isn't skipped.

### Kotis, Sibsig Champion: cast a creature by exiling three others
- **Do:** Open your graveyard and cast Grizzly Bears through Kotis, choosing 3 other cards to exile.
- **Expect:** The graveyard offers 'Cast' (not 'Escape'). The picker reads 'Cast Grizzly Bears - choose 3 other cards to exile' and never offers the Bears itself. The three go to exile as it's cast, and Kotis gets two +1/+1 counters.

### River Kelpie: draws for the Kotis cast, not the creature entering
- **Do:** Open your graveyard and cast Grizzly Bears through Kotis, exiling 3 Forests.
- **Expect:** River Kelpie draws 1 for a spell cast from a graveyard, but not for the Bears entering: it entered from the stack.

### Kotis, Sibsig Champion: once per turn
- **Do:** Cast Grizzly Bears from your graveyard through Kotis, then open your graveyard again.
- **Expect:** Hill Giant is no longer offered.

### Kotis, Sibsig Champion: needs three other cards
- **Do:** Open your graveyard (Grizzly Bears and only 2 other cards).
- **Expect:** The Bears aren't offered to cast.

### Kotis, Sibsig Champion: not on an opponent's turn
- **Do:** It's Bob's turn. Open your graveyard and look at Dualcaster Mage (it has flash).
- **Expect:** It isn't offered to cast: Kotis works only during your own turns.

### Kotis, Sibsig Champion: an Omen card is cast only as the creature
- **Do:** Open your graveyard and look at Stormshriek Feral's options.
- **Expect:** It's offered only as the creature, never as Flush Out.

### Necromantic Selection: pick only a creature it destroyed
- **Do:** Cast Necromantic Selection and look at the graveyard picker.
- **Expect:** Every creature is destroyed. The picker ('Choose a card to put onto the battlefield') offers only creature cards destroyed by this spell, from any graveyard: your Bears and their Angel. Not the Soldier token, not the Hill Giant that was already there. You must pick one (no 'none'). Necromantic Selection is exiled.

### Necromantic Selection: the stolen Angel stays yours
- **Do:** Cast Necromantic Selection and pick the opponent's Serra Angel.
- **Expect:** The Angel enters under your control but is still owned by the opponent. It's white and black, an Angel Zombie, and stays yours afterwards.

### Reunion of the House: total power of 10 or less
- **Do:** Cast Reunion of the House. In the graveyard picker choose both Serra Angels, then try Hill Giant, Grizzly Bears and Ornithopter.
- **Expect:** Confirm stays disabled while the total power is over 10. After the two Angels (8), Hill Giant no longer fits, the Bears do (10), and Ornithopter (0) always fits. All of them return together, and Reunion is exiled.

### Protector of the Wastes: the second target from another player
- **Do:** Cast Protector of the Wastes. At its enters trigger, pick one of Bob's Sol Rings first and look at the second slot.
- **Expect:** The second slot never offers Bob's other Sol Ring. It offers Carol's Phyrexian Arena or your own Sol Ring. Both targets are exiled together.

### Protector of the Wastes: both targets are optional
- **Do:** Cast Protector of the Wastes and choose no targets for its enters trigger.
- **Expect:** That's allowed ('up to two'), and nothing is exiled.

### Protector of the Wastes: in a 2-player game your own counts
- **Do:** Cast Protector of the Wastes. At its enters trigger, pick one of the opponent's Sol Rings first and look at the second slot.
- **Expect:** The second slot offers your own Sol Ring, not the opponent's other one.

### Protector of the Wastes: monstrosity exiles again
- **Do:** Activate Protector of the Wastes' {4}{W} monstrosity.
- **Expect:** It gets 3 +1/+1 counters, and its exile trigger fires again.
- **Not a bug:** No tile badge shows it's monstrous (log only). A second activation is legal and simply does nothing.

### Run Away Together: the second creature from another player
- **Do:** Cast Run Away Together and pick one of Bob's creatures first.
- **Expect:** The second slot excludes Bob's other creature but offers your Grizzly Bears or Carol's Memnite.

### Run Away Together: not castable when one player has every creature
- **Do:** Look at Run Away Together in your hand (only the opponent controls creatures).
- **Expect:** It can't be cast.

### Eliminate the Competition: sacrifice two to destroy two
- **Do:** Cast Eliminate the Competition, choose X = 2, target both opposing creatures, then sacrifice Grizzly Bears and Hill Giant.
- **Expect:** The X prompt tops out at 3 (the creatures you can sacrifice), not at the number of targets. You must pick exactly X targets. The sacrifice prompt reads 'Eliminate the Competition: Sacrifice X - n/X chosen', offers only your own creatures, and comes with the spell already on the stack. Both opposing creatures are destroyed.

### Eliminate the Competition: a target you sacrifice isn't destroyed
- **Do:** Cast Eliminate the Competition with X = 2, targeting the opponent's Serra Angel and your own Hill Giant. Sacrifice Hill Giant and Grizzly Bears.
- **Expect:** Hill Giant is no longer a legal target when the spell resolves, so only Serra Angel is destroyed.

### Eliminate the Competition: a sacrificed Young Pyromancer, no token
- **Do:** Cast Eliminate the Competition with X = 1, targeting an opposing creature, and sacrifice Young Pyromancer.
- **Expect:** No Elemental token is made: the spell isn't cast until its costs are paid, and Young Pyromancer is gone by then.

### Dread Return: the target is chosen before the sacrifice
- **Do:** Open your graveyard and cast Dread Return with flashback (the button should read 'Cast flashback'). Target Serra Angel, then choose 3 creatures in the sacrifice prompt.
- **Expect:** Only cards already in your graveyard are offered as targets, so a creature you sacrifice can't come back. Serra Angel returns, and Dread Return goes to exile, not the graveyard.

### Dread Return: River Kelpie draws twice
- **Do:** Cast Dread Return with flashback from your graveyard, target Serra Angel, and sacrifice Grizzly Bears, Hill Giant and Llanowar Elves (keep River Kelpie).
- **Expect:** River Kelpie draws 2: once for a spell cast from a graveyard, once for Serra Angel entering from a graveyard.

### Dread Return: sacrificing River Kelpie
- **Do:** Cast Dread Return with flashback from your graveyard, target Serra Angel, and sacrifice River Kelpie as one of the three.
- **Expect:** Kelpie's draw for the spell being cast doesn't happen: it had left before the spell was cast. Persist returns it with a -1/-1 counter and it draws 1 for coming back from a graveyard. Persist resolves before Dread Return, so when the Angel enters Kelpie draws again. 2 cards in total.

### Dread Return: exactly three creatures need no prompt
- **Do:** Cast Dread Return with flashback from your graveyard and target Serra Angel (you control exactly 3 creatures).
- **Expect:** No sacrifice prompt: all three go.

### Westvale Abbey: five creatures die together
- **Do:** Activate Westvale Abbey's '{5}, {T}, Sacrifice five creatures: Transform this land, then untap it.'
- **Expect:** With exactly 5 creatures there's no prompt. All five die at once, and Bastion of Remembrance triggers 5 times: the opponent loses 5 and you gain 5. The stack of 5 tokens counts as 5 deaths, not 1.

### Westvale Abbey: six creatures ask which five
- **Do:** Activate Westvale Abbey's '{5}, {T}, Sacrifice five creatures' (you have six creatures).
- **Expect:** A 'Sacrifice 5' prompt appears.

### Westvale Abbey: Ormendahl arrives untapped and attacks
- **Do:** Activate Westvale Abbey's '{5}, {T}, Sacrifice five creatures', then go to combat and attack with Ormendahl.
- **Expect:** The Abbey turns into Ormendahl, Profane Prince: art and name change, 9/7 flying, lifelink, indestructible, haste, and untapped. It can attack this same turn.

### Mondrak, Glory Dominus: sacrifice two other artifacts or creatures
- **Do:** Activate Mondrak's ability, paying one {W/P} with W and the other with 2 life, and choose two permanents to sacrifice.
- **Expect:** Only other permanents are offered: your artifacts and creatures, not Mondrak. Mondrak gets an indestructible counter.

### Zopandrel, Hunger Dominus: sacrifice two other creatures
- **Do:** Activate Zopandrel's {G/P}{G/P} ability and choose two creatures to sacrifice.
- **Expect:** Only your other creatures are offered (not Sol Ring, not Zopandrel). Zopandrel gets an indestructible counter.

### Zopandrel, Hunger Dominus: doubles only your creatures
- **Do:** Go to combat on your turn.
- **Expect:** At the beginning of combat Zopandrel doubles your creatures' power and toughness until end of turn: your Grizzly Bears are 4/4, the opponent's stay 2/2.

### Zopandrel, Hunger Dominus: triggers in opponents' combats too
- **Do:** It's Bob's turn. Watch his beginning of combat.
- **Expect:** Zopandrel triggers and doubles your creatures' power and toughness, not his.

### Hydra Broodmaster: monstrosity makes X Hydras
- **Do:** Activate Hydra Broodmaster's {X}{X}{G} monstrosity with X = 2.
- **Expect:** The X prompt caps at what you can pay twice over plus {G}. It gets 2 counters and becomes monstrous, and its trigger makes 2 Hydra tokens, 2/2 each.
- **Not a bug:** No tile badge shows it's monstrous; only the log and the counters do.

### Hydra Broodmaster: Mondrak doubles the Hydras
- **Do:** Activate Hydra Broodmaster's monstrosity with X = 2.
- **Expect:** With Mondrak out you get 4 Hydra tokens, 2/2 each.

### Whirlwing Stormbrood: what you can cast on an opponent's turn
- **Do:** It's Bob's turn. When you get priority, look at what you can cast: Glorybringer, Grizzly Bears, the second Whirlwing as Dynamic Soar, and Stormshriek Feral as Flush Out.
- **Expect:** Glorybringer (a Dragon) yes, Dynamic Soar and Flush Out (sorceries) yes, Grizzly Bears no.

### Thundermane Dragon: the top card is cast only as the creature
- **Do:** Look at the top of your library (Marang River Regent) and see what can be cast from it.
- **Expect:** Marang River Regent is offered as the creature (power 6) and gains haste when cast. Coil and Catch isn't offered: the Omen half is an instant with no power.

### Stormbreath Dragon: monstrosity hits each opponent by their own hand
- **Do:** Activate Stormbreath Dragon's monstrosity ({5}{R}{R}).
- **Expect:** It gets 3 counters and becomes monstrous. Each opponent takes damage equal to the cards in their own hand, counted as it resolves: Bob 2, Carol 5.

### Stormbreath Dragon: a second monstrosity does nothing
- **Do:** Activate Stormbreath Dragon's monstrosity, let it resolve, then activate it again.
- **Expect:** The second activation does nothing: no counters, no damage.
- **Not a bug:** No 'monstrous' badge on the tile; only the log line 'Stormbreath Dragon becomes monstrous' and the counters show it.

### Giggling Skitterspike: targeted by a spell, it deals damage first
- **Do:** Activate Skitterspike's {5} monstrosity (it becomes 6/6), then cast Giant Growth on it.
- **Expect:** Being targeted triggers 6 damage to each opponent first; then Giant Growth resolves and it's 9/9.

### Giggling Skitterspike: attacking kills a 5-life opponent before blocks
- **Do:** Activate Skitterspike's {5} monstrosity (it becomes 6/6), then attack Carol (at 5 life) with it.
- **Expect:** Before blockers, it deals 6 to each opponent. Carol dies, isn't asked to declare blockers, and her permanents leave the game.

### Giggling Skitterspike: blocking triggers too
- **Do:** Switch to Bob and attack you with Hill Giant. Back as Alice, block with Skitterspike.
- **Expect:** Blocking triggers: Skitterspike deals 1 damage (its power) to each opponent.

### Behind the Scenes: skulk keeps bigger creatures from blocking
- **Do:** Attack with Grizzly Bears. Switch to Bob and declare blockers.
- **Expect:** Hill Giant (greater power) can't block. Grizzly Bears and Llanowar Elves can (equal or lower is fine). Hill Giant can't be selected as a blocker.

### Sidar Kondo of Jamuraa: only fliers block power 2 or less
- **Do:** Attack with Grizzly Bears. Switch to Bob and declare blockers.
- **Expect:** Only Serra Angel can block the Bears; Hill Giant, Grizzly Bears and Llanowar Elves can't be selected.

### Sidar Kondo of Jamuraa: applies when another player attacks
- **Do:** It's Bob's turn. Switch to Bob and attack Carol with Grizzly Bears. Switch to Carol and declare blockers.
- **Expect:** Only Serra Angel can block the Bears; Hill Giant can't.

### Sidar Kondo of Jamuraa: flanking shrinks a blocker
- **Do:** Attack with Sidar Kondo. Switch to Bob and block it with Serra Angel.
- **Expect:** Serra Angel (no flanking) gets -1/-1 until end of turn and becomes 3/3.

### Behind the Scenes: a power change after blocks doesn't undo a block
- **Do:** Attack with Grizzly Bears. Switch to Bob and block with his Grizzly Bears. Back as Alice, activate Behind the Scenes' {4}{W}.
- **Expect:** Your Bears become 3/3 and the block stays.

### Millikin: mill as the cost, mana on resolution
- **Do:** Activate Millikin.
- **Expect:** The top card of your library (Hill Giant) is milled at once as the cost, and the ability goes on the stack where players can respond. {C} is added only when it resolves, and it empties at the end of the step.

### Millikin: not a mana source when paying for a spell
- **Do:** Start casting Sol Ring and look at what the payment step offers.
- **Expect:** Millikin isn't offered as a mana source, and auto-pay doesn't count it.

### Millikin: not activatable with an empty library
- **Do:** Try to activate Millikin (your library is empty).
- **Expect:** It can't be activated.

## Copying abilities, and winning and losing the game (2026-10-03, second round)

### Lithoform Engine: copy an activated ability with a new target
- **Do:** Activate your Prodigal Sorcerer targeting the opponent. Holding priority, activate the Engine's {2},{T} ability and click the Sorcerer's ability on the stack as its target. When asked about new targets for the copy, change it to the opponent's Llanowar Elves.
- **Expect:** Clicking the ability on the stack works as a target. The new-targets prompt shows the opponent already chosen and lets you keep it or change it. The copy resolves first: the Elves die, then the opponent loses 1. The log reads "copies an ability of Prodigal Sorcerer", and the copy's damage comes from the Sorcerer.

### Lithoform Engine: can't copy an opponent's ability
- **Do:** It's Bob's turn. Switch to Bob and activate his Prodigal Sorcerer targeting you. Back as Alice, try to aim the Engine's {2} ability at it.
- **Expect:** Bob's ability is never offered: the Engine only copies abilities you control. Mana abilities never appear as targets either.

### Lithoform Engine: copy a triggered ability
- **Do:** Cast Elvish Visionary. With its enters trigger on the stack, use the Engine's {2} ability on that trigger.
- **Expect:** You draw 2 cards in total.

### Lithoform Engine: copy a permanent spell
- **Do:** Cast Grizzly Bears. With it on the stack, look at the Engine's {3} ability, then use the {4} ability on the Bears.
- **Expect:** The {3} ability doesn't offer the Bears (it only copies your instants and sorceries); the {4} ability does. There's no new-targets prompt, and the copy enters as a token Grizzly Bears next to the real one.

### Lithoform Engine: a copied divided trigger keeps its split
- **Do:** Cast Inferno Titan and divide its enters trigger's 3 damage. With the trigger on the stack, use the Engine's {2} ability on it.
- **Expect:** The copy keeps the same division of damage; only its targets may change.

### Illusionist's Bracers: copies the equipped creature's ability
- **Do:** Activate Prodigal Sorcerer (wearing the Bracers) targeting the opponent. When the copy asks for new targets, pick their Llanowar Elves.
- **Expect:** The Bracers trigger on their own. The Elves die and the opponent loses 1.

### Illusionist's Bracers: a mana ability isn't copied
- **Do:** Tap your Llanowar Elves (wearing the Bracers) for mana.
- **Expect:** Nothing triggers.

### Illusionist's Bracers: no copy once the creature is sacrificed
- **Do:** Activate Sakura-Tribe Elder's sacrifice ability (it's wearing the Bracers).
- **Expect:** No copy: once the cost is paid, the Bracers equip nothing.

### Illusionist's Bracers: the copy survives the original being countered
- **Do:** Activate Prodigal Sorcerer (wearing the Bracers) targeting the opponent. With the Bracers trigger above the ability, cast Sublime Epiphany choosing only 'counter target activated or triggered ability', targeting the Sorcerer's ability (not the trigger).
- **Expect:** The original ability is countered, but the copy is still made, so the opponent still takes 1.

### Inalla, Archmage Ritualist: eminence from the command zone
- **Do:** Cast Prodigal Sorcerer. Say yes to 'Pay {1} to create a token copy of that Wizard?'. Tap the token right away to ping, then pass to the end step.
- **Expect:** Exactly one {1} prompt; the token Wizard entering asks nothing more. The token's {T} works this turn (it has haste), and it's exiled at the beginning of the end step.

### Inalla, Archmage Ritualist: declining eminence makes nothing
- **Do:** Cast Prodigal Sorcerer and decline 'Pay {1} to create a token copy of that Wizard?'.
- **Expect:** No token is made.

### Virtue of Knowledge: doesn't double eminence from the command zone
- **Do:** Cast Prodigal Sorcerer (Inalla is in the command zone).
- **Expect:** Only one {1} prompt.

### Virtue of Knowledge: doubles eminence with Inalla on the battlefield
- **Do:** Cast Prodigal Sorcerer (Inalla is on the battlefield).
- **Expect:** Two {1} prompts, for up to two tokens.

### Virtue of Knowledge: Elvish Visionary draws 2
- **Do:** Cast Elvish Visionary.
- **Expect:** Its enters trigger triggers twice and you draw 2.

### Inalla, Archmage Ritualist: tap five Wizards, sick ones included
- **Do:** Activate Inalla's 'Tap five untapped Wizards you control: Target player loses 7 life', choosing Inalla and the summoning-sick Prodigal Sorcerer among the five, and target the opponent.
- **Expect:** The picker lets you choose exactly which five, the summoning-sick Wizard and Inalla included. The opponent loses 7.

### Electroduplicate: a copy of its token keeps the extras
- **Do:** Cast Electroduplicate on Grizzly Bears. Then cast it again with flashback, targeting the token.
- **Expect:** The new token also has haste and 'At the beginning of the end step, sacrifice this token.'

### Thousand-Year Storm: creature spells don't count
- **Do:** Cast Opt, then Grizzly Bears, then Shock at the opponent. When the copy asks for a target, pick their Grizzly Bears.
- **Expect:** Opt gets no copies. Shock gets 1 (the Bears spell didn't count). The copy resolves before the original.

### Thousand-Year Storm: each copy gets its own target
- **Do:** Cast Opt, then Shock, then Lightning Bolt. Give each Bolt copy a different target (the Elves, the opponent).
- **Expect:** Lightning Bolt gets 2 copies. Each asks for new targets on its own, one at a time; note whether it's clear which copy you're aiming. Copies resolve before the original and aren't cast, so they don't trigger the Storm.

### Thousand-Year Storm: a countered spell still counts
- **Do:** Cast Opt. Switch to Bob and Counterspell it. Back as Alice, cast Shock.
- **Expect:** Shock is copied once: the countered Opt still counts.

### Thousand-Year Storm: spells cast before it arrived count
- **Do:** Cast Opt, then cast Thousand-Year Storm, then cast Shock.
- **Expect:** Shock is copied once: the Opt cast before the Storm counts.

### Thousand-Year Storm: the count is fixed as it triggers
- **Do:** Cast Opt. Then cast Lightning Bolt and, before passing priority, cast Shock.
- **Expect:** Lightning Bolt is copied once (for Opt). The Shock cast in response doesn't add to the Bolt's copies.

### Brain Freeze: storm counts every player's spells
- **Do:** Cast Opt. Switch to Bob and Counterspell it. Back as Alice, cast Brain Freeze targeting Bob.
- **Expect:** Brain Freeze gets 2 copies (your Opt and Bob's Counterspell), and each copy may pick its own target player.

### Chain of Vapor: the bounced player may copy it back
- **Do:** Cast Chain of Vapor at Bob's Grizzly Bears. Switch to Bob: say yes to 'Sacrifice a land', pick the land, say yes to 'Copy Chain of Vapor?', and aim the copy at your Grizzly Bears. Back as Alice, decline.
- **Expect:** Each prompt appears on the right player's screen: Bob is asked, then picks which land. The copy is Bob's, and the log shows him as its controller. Your Bears return to your hand, and the chain ends when you decline.

### Chain of Vapor: no lands, no offer
- **Do:** Cast Chain of Vapor at Bob's Grizzly Bears (Bob has no lands). Switch to Bob.
- **Expect:** Bob isn't offered 'Sacrifice a land'.

### Chain of Vapor: the controller is asked, not the owner
- **Do:** Cast Act of Treason on Bob's Hill Giant, then cast Chain of Vapor on the Giant.
- **Expect:** You (the Giant's controller as it left) are asked about sacrificing a land, not Bob. The Giant goes to Bob's hand.

### Sink into Stupor: returns a spell on the stack
- **Do:** Switch to Bob and Lightning Bolt you. Back as Alice, respond with Sink into Stupor, clicking the Bolt on the stack.
- **Expect:** The Bolt goes back to Bob's hand without resolving. The log says it was returned, not countered.

### Sink into Stupor: works on a spell that can't be countered
- **Do:** Switch to Bob and cast Abrupt Decay on your Grizzly Bears. Back as Alice, respond with Sink into Stupor on the Decay.
- **Expect:** Abrupt Decay goes back to Bob's hand and your Bears stay.

### Sink into Stupor: returns a creature
- **Do:** Cast Sink into Stupor at Bob's Grizzly Bears.
- **Expect:** The Bears go to Bob's hand.

### Sink into Stupor: only an opponent's spells and nonland permanents
- **Do:** Cast Opt, and with it on the stack start casting Sink into Stupor. Look at what you can target.
- **Expect:** Only Bob's Grizzly Bears is offered. Not Bob's lands, not your Grizzly Bears, not your Opt.

### Soporific Springs: pay 3 life to enter untapped
- **Do:** Play Sink into Stupor as its land, Soporific Springs, and pay 3 life.
- **Expect:** You're asked 'pay 3 life?'. Paying, it enters untapped and you lose 3.

### Soporific Springs: decline and it enters tapped
- **Do:** Play Sink into Stupor as its land, Soporific Springs, and decline to pay 3 life.
- **Expect:** It enters tapped and your life doesn't change.

### Wandering Archaic: an opponent who can't pay {2} isn't asked
- **Do:** Switch to Bob (one Mountain) and Lightning Bolt you.
- **Expect:** Bob isn't asked to pay {2}. You're asked 'Copy that spell?'.

### Wandering Archaic: unpaid, you copy the spell
- **Do:** Switch to Bob (three lands) and Lightning Bolt you. Decline 'Pay {2}'. Back as Alice, say yes to 'Copy that spell?' and retarget the copy to Bob.
- **Expect:** Bob, not you, gets the pay {2} question. Your copy resolves before his Bolt.

### Wandering Archaic: paid, no copy
- **Do:** Switch to Bob (three lands) and Lightning Bolt you. Answer 'Pay {2}'.
- **Expect:** You aren't offered a copy.

### Explore the Vastlands: each player picks from their own top five
- **Do:** Cast Explore the Vastlands. Pick a land and then an instant or sorcery from your top five. Then switch to Bob and watch him pick.
- **Expect:** You pick first (it's your turn). At Bob's seat you see only the cards you revealed, never the other three you looked at, and Bob chooses after seeing them.

### Explore the Vastlands: taking nothing still gains 3
- **Do:** Cast Explore the Vastlands and take nothing. At Bob's seat, take nothing too.
- **Expect:** Both picks are optional. The cards go to the bottom in random order, and everyone gains 3 life.

### Thassa's Oracle: devotion 2 against a library of 2 wins
- **Do:** Cast Thassa's Oracle and let its enters trigger resolve (your library has 2 cards).
- **Expect:** You win at once and the game ends with you as winner, even with two opponents. The result shows 'won the game with Thassa's Oracle'.

### Thassa's Oracle: a library of 5 doesn't win
- **Do:** Cast Thassa's Oracle and keep the second card on top.
- **Expect:** The look shows only the top 2 cards. Your pick stays on top, the other goes to the bottom, and you don't win.

### Thassa's Oracle: devotion equal to the library wins
- **Do:** Cast Thassa's Oracle with Laboratory Maniac out (your library has 3 cards).
- **Expect:** Devotion 3 against a library of 3 wins.

### Thassa's Oracle: removed in response, devotion drops
- **Do:** Cast Thassa's Oracle. With its enters trigger on the stack, switch to Bob and Lightning Bolt the Oracle.
- **Expect:** Devotion is counted as the trigger resolves and is 2 lower without the Oracle, so you don't win.

### Pact of Negation: pay at your next upkeep
- **Do:** Switch to Bob and cast Grizzly Bears. Back as Alice, counter it with Pact of Negation for {0}. At your next upkeep, pay.
- **Expect:** At your next upkeep you're asked 'Pay {3}{U}{U}.'. Check that it's clear declining loses, and which lands get tapped. Paying keeps you in the game.

### Pact of Negation: can't pay, you lose
- **Do:** Switch to Bob and cast Grizzly Bears. Back as Alice, counter it with Pact of Negation. Pass to your next upkeep (you have only two lands).
- **Expect:** No prompt: you lose at once ('lost the game to Pact of Negation').
- **Not a bug:** The payment is offered only when you can afford it; otherwise the loss is automatic.

### Pact of Negation: a countered Pact costs nothing later
- **Do:** Switch to Bob and cast Grizzly Bears. Back as Alice, counter it with Pact of Negation. At Bob's seat, Counterspell your Pact. Pass to your next upkeep.
- **Expect:** Nothing is asked at your upkeep.

### Pact of Negation: against Abrupt Decay you still pay
- **Do:** Switch to Bob and cast Abrupt Decay on your Grizzly Bears. Back as Alice, cast Pact of Negation on it. Pass to your next upkeep.
- **Expect:** The Pact resolves but Abrupt Decay isn't countered. At your upkeep you must still pay.

### Summoner's Pact: only green creatures
- **Do:** Cast Summoner's Pact, pick a card, then pass to your next upkeep.
- **Expect:** It offers only green creature cards (Grizzly Bears, Craw Wurm, Llanowar Elves; not Hill Giant) and reveals your pick. At your next upkeep it asks for {2}{G}{G}.

### Mirrodin Besieged: Phyrexian, the 15th artifact makes the target lose
- **Do:** Cast Mirrodin Besieged and choose Phyrexian. Go to your end step, target Bob, and when it resolves discard Sol Ring.
- **Expect:** The Mirran or Phyrexian choice appears as it enters. You pick the target opponent as the trigger goes on the stack, even with only 14 artifacts. As it resolves you draw, discard, then count: the 15th artifact makes Bob lose, and the game goes on for you and Carol.

### Mirrodin Besieged: destroying it in response doesn't stop it
- **Do:** Cast Mirrodin Besieged and choose Phyrexian. At your end step, target Bob. With the trigger on the stack, switch to Bob and Abrupt Decay Mirrodin Besieged. Back as Alice, discard Sol Ring.
- **Expect:** The trigger still resolves and Bob loses.

### Mirrodin Besieged: Mirran makes a Myr
- **Do:** Cast Mirrodin Besieged and choose Mirran. Cast Sol Ring, then pass to your end step.
- **Expect:** Casting Sol Ring makes a 1/1 Myr. Nothing triggers at your end step.

### Weaver of Harmony: pumps other enchantment creatures
- **Do:** Look at your two Weavers of Harmony.
- **Expect:** Each gets +1/+1 from the other Weaver, never from itself.

### Weaver of Harmony: a copied Banishing Light trigger is linked too
- **Do:** Cast Banishing Light targeting Bob's Grizzly Bears. With its exile trigger on the stack, activate Weaver ({G},{T}) targeting that trigger, and change the copy's target to Bob's Llanowar Elves. Then switch to Bob and Abrupt Decay the Banishing Light.
- **Expect:** Both the Bears and the Elves are exiled, and both come back when Banishing Light leaves.

### Weaver of Harmony: won't copy a creature's ability
- **Do:** Activate Prodigal Sorcerer, then try to target its ability with Weaver.
- **Expect:** The Sorcerer's ability isn't offered: its source isn't an enchantment.

### Weaver of Harmony: judges the source as it last was
- **Do:** Cast Mirrormade copying the opponent's Mind Stone. Activate its '{1},{T}, Sacrifice: draw a card', then try to target that ability with Weaver.
- **Expect:** It isn't offered. Mirrormade is an enchantment card in the graveyard now, but on the battlefield it was an artifact.

### Vantress Visions: copy an ability, then cast Virtue later
- **Do:** Activate Prodigal Sorcerer targeting the opponent. With it on the stack, cast Vantress Visions (the Adventure, {1}{U}) targeting the Sorcerer's ability.
- **Expect:** The ability is copied with a new-targets prompt. The card goes to exile on an adventure, and Virtue of Knowledge can be cast from there later.

### Sword of Wealth and Power: protection from instants
- **Do:** Switch to Bob and try to Lightning Bolt your equipped Grizzly Bears. Then activate his Prodigal Sorcerer at it.
- **Expect:** Lightning Bolt can't target the Bears; the Sorcerer's ability can.

### Sword of Wealth and Power: the next instant is copied once
- **Do:** Attack with the equipped Grizzly Bears. After combat damage, cast Lightning Bolt, then Opt.
- **Expect:** Combat damage gives a Treasure. Lightning Bolt is copied once; Opt isn't.

### Sword of Wealth and Power: the copy doesn't carry to next turn
- **Do:** Attack with the equipped Grizzly Bears and cast nothing after combat damage. On your next turn, cast Lightning Bolt.
- **Expect:** Lightning Bolt isn't copied.

### Thunderclap Drake: instants and sorceries cost {1} less
- **Do:** Look at the costs of Divination and Opt in your hand.
- **Expect:** Divination costs {1}{U}. Opt still costs {U}: only generic mana is reduced.

### Thunderclap Drake: no commander casts, no copies
- **Do:** Activate Thunderclap Drake ({2}{U}, sacrifice it), then cast Lightning Bolt (Krenko has never been cast).
- **Expect:** Lightning Bolt isn't copied.

### Thunderclap Drake: one copy per commander cast
- **Do:** Cast Krenko, Mob Boss from the command zone. Then activate Thunderclap Drake ({2}{U}, sacrifice it) and cast Lightning Bolt.
- **Expect:** Lightning Bolt is copied once: one cast of your commander from the command zone.

### Primal Amulet: decline the flip, then accept it
- **Do:** Cast Opt so Primal Amulet gets its 4th charge counter, and decline the prompt. Then cast Lightning Bolt and accept.
- **Expect:** 'Remove the charge counters and transform Primal Amulet?' appears at 4 counters, and comes back on the next instant after you decline. Accepting removes every counter and flips it to the land, Primal Wellspring.

### Primal Wellspring: a countered Bolt is still copied
- **Do:** Cast Opt and accept the transform prompt. Tap Primal Wellspring for R and spend it on Lightning Bolt. Switch to Bob and Counterspell the Bolt.
- **Expect:** The Bolt is still copied, even though it's countered.

### Primal Wellspring: mana spent on a creature copies nothing
- **Do:** Cast Opt and accept the transform prompt. Tap Primal Wellspring for R and spend it on Hill Giant.
- **Expect:** No copy.

### Reverberate: copy an opponent's Bolt at them
- **Do:** Switch to Bob and Lightning Bolt you. Back as Alice, Reverberate it and aim the copy at Bob.
- **Expect:** You control the copy and it resolves first: Bob takes 3.

### Dualcaster Mage: a copied Divination draws for you
- **Do:** Switch to Bob and cast Divination. Back as Alice, flash in Dualcaster Mage targeting it.
- **Expect:** The copy resolves first and you draw 2: 'you' on a copy means its controller.

### Reverberate: a copied Izzet Charm keeps its mode
- **Do:** Switch to Bob and cast Izzet Charm, choosing '2 damage to target creature' on your Grizzly Bears. Back as Alice, Reverberate it.
- **Expect:** The copy keeps the damage mode and offers no other mode. You may retarget it.

### Kitsa, Otterball Elite: copying needs power 3
- **Do:** Look at Kitsa's copy ability. Cast Opt and look again. Then cast Brainstorm and, once prowess has resolved, copy the Brainstorm with Kitsa.
- **Expect:** The copy ability is unavailable at power 1 or 2 and available at 3. It targets only instants and sorceries you control.

### Kitsa, Otterball Elite: never an opponent's spell
- **Do:** Switch to Bob and Lightning Bolt you. Back as Alice, look at Kitsa's copy ability (Kitsa has power 3).
- **Expect:** Bob's Bolt isn't offered as a target.

### Jin-Gitaxias, Progress Tyrant: copies your first artifact each turn
- **Do:** Cast Sol Ring, then the second Sol Ring, then Opt.
- **Expect:** The first Sol Ring is copied: a token Sol Ring enters. The second Sol Ring and Opt aren't copied.

### Jin-Gitaxias, Progress Tyrant: counters once per turn in total
- **Do:** It's Bob's turn. Switch to Bob and cast Lightning Bolt. Then switch to Carol and cast Shock.
- **Expect:** Bob's Bolt is countered automatically, but Carol's Shock resolves: the counter triggers once each turn in total, not once per opponent.

### Jin-Gitaxias, Progress Tyrant: copying resets each turn
- **Do:** Cast Sol Ring. Pass to your next turn and cast the second Sol Ring.
- **Expect:** Both Sol Rings are copied.

### Jin-Gitaxias, Progress Tyrant: an artifact cast before it arrived
- **Do:** Cast Sol Ring, then cast Jin-Gitaxias, then cast the second Sol Ring.
- **Expect:** The second Sol Ring is copied.

### Laboratory Maniac: drawing from an empty library wins
- **Do:** Cast Divination (your library has 1 card).
- **Expect:** You draw the 1 card, the second draw is replaced, and you win ('won the game with Laboratory Maniac').

### Laboratory Maniac: the opponent's Platinum Angel stops the win
- **Do:** Cast Opt (your library is empty; the opponent has Platinum Angel).
- **Expect:** Nothing happens: the draw is still replaced, so you don't win, and you don't lose at the next check either.

### Platinum Angel: you stay in at 0 life
- **Do:** Switch to Bob and Lightning Bolt you (you're at 1 life). Keep playing a turn or two.
- **Expect:** You stay in the game at -2 life.

### Platinum Angel: you stay in with 10 poison
- **Do:** Pass priority and play on (you have 10 poison counters).
- **Expect:** You stay in the game.

### Platinum Angel: you lose once it leaves
- **Do:** Switch to Bob and Lightning Bolt you (you're at 1 life). Back as Alice, cast Doom Blade on your Platinum Angel.
- **Expect:** You lose at the next check once the Angel is gone.

### Platinum Angel: conceding still loses
- **Do:** Concede.
- **Expect:** You lose, even with Platinum Angel out.

### Herald of Eternal Dawn: flashed in, you stay in at 0 life
- **Do:** Switch to Bob and Lightning Bolt you (you're at 1 life). Back as Alice, flash in Herald of Eternal Dawn in response.
- **Expect:** You stay in the game at -2 life.

### Notion Thief: an opponent's draws win you the game
- **Do:** Switch to Bob and cast Divination (your library is empty, with Laboratory Maniac out).
- **Expect:** Bob's draws become yours, and you win.

### Jace, Wielder of Mysteries: -8 wins from a library of 5
- **Do:** Use Jace's -8 (Jace dies to the loyalty cost before it resolves).
- **Expect:** Seven draws from 5 cards still wins, before the loss for drawing from an empty library.

### Jace, Wielder of Mysteries: +1 mills, then draws
- **Do:** Use Jace's +1 targeting yourself.
- **Expect:** You mill two, then draw a card.

### Angel's Grace: split second
- **Do:** Switch to Bob and attack you with both creatures. Back as Alice, cast Angel's Grace. At Bob's seat, try to respond.
- **Expect:** While Angel's Grace is on the stack, Bob is offered only mana abilities.

### Angel's Grace: combat damage stops at 1
- **Do:** Switch to Bob and attack you with both creatures. Back as Alice, cast Angel's Grace, let it resolve, and don't block.
- **Expect:** You're left at 1 life, not below. Bob still gains 2 from Vampire Nighthawk's lifelink.

### Angel's Grace: life loss still goes below 1
- **Do:** Switch to Bob and pass priority. As Alice, cast Angel's Grace. Then, as Bob, cast Sign in Blood targeting you, then Lightning Bolt at you.
- **Expect:** Sign in Blood's life loss isn't stopped: you drop to -1. The Bolt lowers you further. You're still in the game.

### Angel's Grace: you lose at cleanup
- **Do:** Switch to Bob and pass priority. As Alice, cast Angel's Grace. As Bob, cast Sign in Blood targeting you, then pass to the end of the turn.
- **Expect:** You stay in the game until the cleanup step; then the effect ends and you lose, before the next turn.

### Everybody Lives!: Night's Whisper costs no life
- **Do:** Cast Everybody Lives!, then Night's Whisper.
- **Expect:** You draw 2 and lose no life.

### Everybody Lives!: Toxic Deluge only for X = 0
- **Do:** Cast Everybody Lives!, then try to cast Toxic Deluge.
- **Expect:** It can be cast only with X = 0.

### Everybody Lives!: Phyrexian mana needs real mana
- **Do:** Cast Everybody Lives!, then try to cast Dismember paying life for its Phyrexian pips (you have no black mana).
- **Expect:** You can't: the pips must be paid with mana.

### Everybody Lives!: Steam Vents enters tapped
- **Do:** Cast Everybody Lives!, then play Steam Vents.
- **Expect:** It doesn't offer 'pay 2 life', and enters tapped.

### Everybody Lives!: hexproof for the opponent's creatures
- **Do:** Cast Everybody Lives!, then start casting Dismember and look at its targets.
- **Expect:** The opponent's creatures can't be targeted: every creature has hexproof (and is indestructible).

### Everybody Lives!: conceding still loses
- **Do:** Cast Everybody Lives!, then concede.
- **Expect:** You lose.

### Toxic Deluge: paying your last life loses before it resolves
- **Do:** Cast Toxic Deluge with X = 3, paying exactly your life total. Watch the rest of the turn.
- **Expect:** X = 3 is allowed. You drop to 0 and lose as soon as the game checks, before the Deluge resolves: it leaves with you, and Bob's and Carol's creatures are untouched. You never get priority again, there's no attack step for you and no cleanup discard, and play passes to Bob. Your seat shows you out, with the loss reason.
- **Not a bug:** Your permanents stay where they are, visible but out of the game.

### Pact of Negation: losing in your own upkeep
- **Do:** Cast Opt, then counter it with your own Pact of Negation. Pass the turn and let Bob and Carol play theirs (you have one Island).
- **Expect:** You lose in your own upkeep, skip your draw, and the game carries on with Bob and Carol.

### Felidar Sovereign: wins at your upkeep at 40 life
- **Do:** It's Bob's end step. Pass to your upkeep.
- **Expect:** You win at your upkeep.

### Felidar Sovereign: Bolted in response, no win
- **Do:** It's Bob's end step. Pass to your upkeep. With Felidar's trigger on the stack, switch to Bob and Lightning Bolt you (to 37).
- **Expect:** You don't win: the condition must still hold as the trigger resolves.

### Triskaidekaphile: wins with exactly 13 in hand
- **Do:** It's Bob's end step. Pass to your upkeep (13 cards in hand).
- **Expect:** You win.

### Triskaidekaphile: 14 in hand doesn't trigger
- **Do:** It's Bob's end step. Pass to your upkeep (14 cards in hand).
- **Expect:** Triskaidekaphile doesn't trigger.

### Triskaidekaphile: no cleanup discard
- **Do:** Pass to the end of your turn (14 cards in hand).
- **Expect:** No discard at cleanup: you have no maximum hand size.

### Helix Pinnacle: X counters, then a win at 100
- **Do:** Activate Helix Pinnacle with X = 1. Pass to your next upkeep.
- **Expect:** The X prompt works and Pinnacle reaches 100 tower counters. You win at your upkeep.

### Helix Pinnacle: Abrupt Decay can't target it
- **Do:** It's Bob's turn. Switch to Bob and try to cast Abrupt Decay on Helix Pinnacle.
- **Expect:** Helix Pinnacle can't be targeted (shroud).

### Simic Ascendancy: one counter, one growth counter, a win at 20
- **Do:** Use Simic Ascendancy's {1}{G}{U} on your Grizzly Bears. Pass to your next upkeep.
- **Expect:** One +1/+1 counter gives 1 growth counter (20). You win at your upkeep.

### Revel in Riches: Treasures only for opponents' creatures
- **Do:** Lightning Bolt the opponent's Llanowar Elves, then Lightning Bolt your own Grizzly Bears.
- **Expect:** The Elves dying gives you a Treasure; your Bears dying doesn't.

### Hellkite Tyrant: takes only the damaged player's artifacts
- **Do:** Attack Bob with Hellkite Tyrant and connect.
- **Expect:** You gain control of Bob's artifacts, for good. Carol's are untouched.

### Knuckles the Echidna: one Treasure per combat damage step
- **Do:** Attack with Knuckles and Grizzly Bears, both unblocked.
- **Expect:** 2 Treasures: one per combat damage step with double strike, not one per creature.

### Reliquary Tower: newer than the Toad, no discard
- **Do:** Play Reliquary Tower and pass to cleanup (25 cards in hand).
- **Expect:** No maximum hand size: you don't discard.

### Twenty-Toed Toad: newer than the Tower, discard to 20
- **Do:** Cast Twenty-Toed Toad and pass to cleanup (Reliquary Tower is already out).
- **Expect:** You discard down to 20.

### Twenty-Toed Toad: order the triggers to win
- **Do:** Attack with the Toad and Grizzly Bears (19 cards in hand). Order the two triggers so 'put a +1/+1 counter on this creature and draw a card' resolves first.
- **Expect:** The trigger-order prompt appears and reads clearly, including which one resolves first. You reach 20 cards and win as the attack trigger resolves.

### Twenty-Toed Toad: the other order doesn't win
- **Do:** Attack with the Toad and Grizzly Bears (19 cards in hand). Order the triggers so the win trigger resolves first.
- **Expect:** You don't win: it checks only as it resolves.

### Approach of the Second Sun: the first one goes back in the library
- **Do:** Cast Approach of the Second Sun.
- **Expect:** You gain 7, and it goes into your library under the top six cards.

### Approach of the Second Sun: the second one from hand wins
- **Do:** Cast Approach of the Second Sun, then cast the second copy from your hand.
- **Expect:** You win.

### Approach of the Second Sun: a countered first still counts
- **Do:** Cast Approach of the Second Sun. Switch to Bob and Counterspell it. Back as Alice, cast the second copy.
- **Expect:** You win.

### Approach of the Second Sun: a short library takes it at the bottom
- **Do:** Cast Approach of the Second Sun (your library has 3 cards).
- **Expect:** You gain 7 and it goes to the bottom of your library.

### Approach of the Second Sun: the same card recast counts
- **Do:** Cast Approach of the Second Sun (your library is empty, so it becomes the only card). Cast Opt to draw it, then cast it again.
- **Expect:** You win: the same card cast again counts as another spell.

### Approach of the Second Sun: a Reverberate copy just stops existing
- **Do:** Cast Approach of the Second Sun. Cast the second copy, and with it on the stack, Reverberate it.
- **Expect:** The copy resolves first: you gain 7 and it stops existing instead of going into your library. Then the real one wins.

### Vorpal Sword: a player hit loses the game
- **Do:** Activate Vorpal Sword's {5}{B}{B}{B} ability, then attack Bob with the equipped Bears.
- **Expect:** Bob loses ('lost the game to Vorpal Sword'). The game goes on between you and Carol, and Bob's turn is skipped.

### Vorpal Sword: without the activation it's only +2/+0
- **Do:** Attack Bob with the equipped Bears without activating the Sword.
- **Expect:** Bob just takes 4 damage. The Bears have +2/+0 and deathtouch.

### Vorpal Sword: the ability lasts only that turn
- **Do:** Activate Vorpal Sword's {5}{B}{B}{B} ability but don't attack. On your next turn, attack Bob without activating it.
- **Expect:** Bob only takes damage; he doesn't lose.

### Summon: Primal Odin: chapter II makes a hit player lose
- **Do:** Go to your precombat main and let chapter II resolve. Attack Bob with Odin.
- **Expect:** Bob loses ('lost the game to Summon: Primal Odin').

### Summon: Primal Odin: the trigger works after Odin is gone
- **Do:** Go to your precombat main and let chapter II resolve. Attack Bob with Odin; with its combat-damage trigger on the stack, Lightning Bolt Odin.
- **Expect:** Bob still loses.

### Platinum Angel: Bob doesn't lose to Vorpal Sword
- **Do:** Activate Vorpal Sword's {5}{B}{B}{B} ability, then attack Bob (he has Platinum Angel) with the equipped Bears.
- **Expect:** Bob doesn't lose.

## Mana abilities: colours chosen, lands' types, doubling (2026-10-03, third round)

### Nykthos: one menu entry per colour you have devotion to
- **Do:** Click Nykthos, Shrine to Nyx and read its ability menu.
- **Expect:** '{T}: Add {C}.', then '...(add {U})', '...(add {B}{B}{B})', '...(add {G}{G})' in that order, then a single '...(add no mana)' entry covering white and red.
- **Not a bug:** Deathrite Shaman's hybrid {B/G} counts once for black and once for green, and Nykthos adds no devotion of its own.

### Nykthos: tapping for black
- **Do:** Click Nykthos and pick the black entry.
- **Expect:** Two Islands pay the {2} (Nykthos never pays for itself). Your pool shows {B}{B}{B}, and nothing goes on the stack.

### Nykthos: pays for a second Gray Merchant
- **Do:** With only your three Islands and Nykthos untapped, cast the Gray Merchant of Asphodel in your hand.
- **Expect:** It's offered for casting and gets paid: two Islands pay Nykthos's {2} for {B}{B}{B}, the third Island pays the rest.

### Nykthos: the menu updates when devotion changes
- **Do:** Open Nykthos's menu. Cast Llanowar Elves with the Forest, then open Nykthos's menu again.
- **Expect:** The green entry goes from '(add {G}{G})' to '(add {G}{G}{G})' straight away. A stale count is a bug.

### Nyx Lotus: tapped by hand, no {2} to pay
- **Do:** Click Nyx Lotus and read its menu, then pick the black entry.
- **Expect:** One entry per colour you have devotion to ('(add {B}{B}{B})', '(add {G})'), then one '(add no mana)' entry. Nothing is paid but the tap, and Nyx Lotus's own {4} adds no devotion.

### Nyx Lotus: enters tapped
- **Do:** Cast Nyx Lotus.
- **Expect:** It enters the battlefield tapped.

### Nykthos: Mana Reflection doubles the black
- **Do:** Click Nykthos and pick the black entry (devotion to black is 3).
- **Expect:** Six {B} are added.
- **Not a bug:** Extra mana from whatever paid the {2} may also sit in your pool; count the {B}.

### Nykthos: Mirari's Wake's extra {B} isn't doubled
- **Do:** Click Nykthos and pick the black entry (devotion to black is 3).
- **Expect:** Seven {B} are added: Mana Reflection's six, plus one from Mirari's Wake that isn't doubled.
- **Not a bug:** Extra mana from whatever paid the {2} may also sit in your pool; count the {B}.

### Three Tree City: two mana of any one colour for two Bears
- **Do:** Play Three Tree City and choose Bear. Click it and pick the red entry of its second ability.
- **Expect:** A creature-type prompt appears as it enters. The menu shows '{T}: Add {C}.' plus five entries, '(add {W}{W})' to '(add {G}{G})': any colour, and the Elf isn't counted. Red taps both Swamps for the {2} and adds {R}{R}.

### Three Tree City: no creature of the chosen type
- **Do:** Play Three Tree City and choose Bear (you control no Bears). Click it.
- **Expect:** Its second ability offers only '(add no mana)'.

### Mox Amber: no mana without a legendary of your own
- **Do:** Click Mox Amber (Bob controls Teysa Karlov; your creatures aren't legendary).
- **Expect:** It offers only '(add no mana)'.

### The Grey Havens: an opponent's graveyard doesn't count
- **Do:** Click The Grey Havens (your graveyard has Grizzly Bears, Bob's has Kinnan, Bonder Prodigy).
- **Expect:** Its coloured ability offers only '(add no mana)'.

### Mox Amber: one mana of one of Teysa's colours
- **Do:** Click Mox Amber (you control Teysa Karlov).
- **Expect:** It offers {W} and {B} as separate entries: one mana of one of those colours, never one of each.

### Plaza of Heroes: mana among your legendary permanents
- **Do:** Click Plaza of Heroes (you control Teysa Karlov) and read its 'among legendary permanents' ability.
- **Expect:** It offers {W} and {B} as separate entries: one mana of one of those colours, never one of each.

### The Grey Havens: a legendary creature card in your graveyard
- **Do:** Click The Grey Havens (Teysa Karlov is in your graveyard).
- **Expect:** Its coloured ability offers {W} and {B}.

### Faeburrow Elder: grows with each colour you control
- **Do:** Look at Faeburrow Elder's size, then cast Teysa Karlov.
- **Expect:** Elder is 2/2 alone (its own green and white) and 3/3 once Teysa is out. Lands don't count.

### Bloom Tender: one mana of each colour, no prompt
- **Do:** Tap Bloom Tender for mana (you control Teysa Karlov).
- **Expect:** No prompt: it adds {W}{B}{G}, one of each colour. Lands are colourless and never add {C}.

### Faeburrow Elder: one mana of each colour, no prompt
- **Do:** Tap Faeburrow Elder for mana (you control Teysa Karlov).
- **Expect:** No prompt: it adds {W}{B}{G}, one of each colour, never {C}.

### Bloom Tender: alone it makes just {G}
- **Do:** Tap Bloom Tender for mana.
- **Expect:** It adds just {G}.

### Plaza of Heroes: legendary-only mana won't cast Lightning Bolt
- **Do:** Tap Plaza of Heroes for {R} with its 'legendary spell' ability, then try to cast Lightning Bolt.
- **Expect:** Bolt can't be paid with that mana.
- **Not a bug:** The pool doesn't show the restriction; trying to spend it is the test.

### Plaza of Heroes: legendary-only mana casts a legendary spell
- **Do:** Tap Plaza of Heroes for {R} with its 'legendary spell' ability, then cast Krenko, Mob Boss with it and three Mountains.
- **Expect:** Krenko is cast, using the Plaza's mana.

### Chrome Mox: what can be imprinted
- **Do:** Cast Chrome Mox and look at the imprint prompt.
- **Expect:** It's titled 'Choose a card to exile' and offers only Izzet Charm and Kozilek's Channeler (not Sol Ring, not the Forest). You can decline it.

### Chrome Mox: an imprinted Izzet Charm gives {U} or {R}
- **Do:** Cast Chrome Mox, exile Izzet Charm, then click the Mox.
- **Expect:** Izzet Charm is in exile face up. The Mox offers {U} or {R}, your pick each tap, never {C}.

### Chrome Mox: a recast Mox loses its old imprint
- **Do:** Cast Chrome Mox exiling Izzet Charm. Boomerang the Mox, recast it and decline the imprint. Click the Mox.
- **Expect:** Izzet Charm stays in exile, but the new Mox shows only '(add no mana)'.

### Chrome Mox: a colourless imprint gives no mana
- **Do:** Cast Chrome Mox, exile Kozilek's Channeler, then click the Mox.
- **Expect:** It shows only '(add no mana)', never {C}.

### Mirari's Wake: you pick the extra mana's type
- **Do:** Click Azorius Chancery and pick the second entry.
- **Expect:** Two entries, '(add {W}{U}{W})' and '(add {W}{U}{U})'. The second leaves {W}{U}{U} in your pool.

### Mirari's Wake: creatures get +1/+1
- **Do:** Look at your Grizzly Bears.
- **Expect:** Grizzly Bears is 3/3.

### Mirari's Wake: the extra mana isn't creature-only
- **Do:** Cast Savannah Lions and let the auto-payer use Ancient Ziggurat. Then cast Swords to Plowshares (on the Lions) with the mana left over.
- **Expect:** One mana is left floating after the Lions, and it pays for Swords to Plowshares.
- **Not a bug:** The pool doesn't show restrictions; spending it is the test.

### Fertile Ground: one extra mana of any colour
- **Do:** Tap the enchanted Forest by hand and pick a colour.
- **Expect:** Five entries, one per extra colour. Your pool gets {G} plus the colour you picked.

### Utopia Sprawl: can only enchant a Forest
- **Do:** Cast Utopia Sprawl and look at what you can target.
- **Expect:** Only a Forest can be targeted, not the Plains.

### Utopia Sprawl: the Forest adds {G}{U} with no prompt
- **Do:** Cast Utopia Sprawl (paid by one Forest) on the other Forest and name blue. Tap the enchanted Forest by hand.
- **Expect:** A colour is asked as it enters. The Forest then adds {G}{U}, with no further prompt.

### Utopia Sprawl: the auto-payer counts the extra mana
- **Do:** Cast Utopia Sprawl (paid by one Forest) on the other Forest and name blue. Cast Think Twice.
- **Expect:** The lone enchanted Forest pays Think Twice's {1}{U}.

### Zendikar Resurgent: a Forest makes {G}{G}
- **Do:** Tap a Forest by hand.
- **Expect:** It adds {G}{G}.

### Zendikar Resurgent: draws when you cast a creature
- **Do:** Cast Grizzly Bears.
- **Expect:** You draw a card.

### Kinnan: lands get no extra mana
- **Do:** Tap the Forest by hand.
- **Expect:** It adds just {G}.

### Kinnan: Azorius Signet makes three mana
- **Do:** Tap Azorius Signet by hand.
- **Expect:** Two entries, three mana each: the Signet's {W}{U} plus an extra {W} or {U}. The Swamp pays the {1}.

### Kinnan: a Treasure makes two of one colour
- **Do:** Tap the Treasure for mana by hand.
- **Expect:** Five entries. The Treasure is sacrificed and you get two mana of the colour you picked.

### Kinnan: Birds of Paradise makes two of one colour
- **Do:** Tap Birds of Paradise by hand.
- **Expect:** Five entries, each '(add {X}{X})': two of one colour.

### Kinnan: Sol Ring makes three
- **Do:** Tap Sol Ring by hand.
- **Expect:** It adds {C}{C}{C}.

### Kinnan: the look-at-five ability
- **Do:** Activate Kinnan's {5}{G}{U} ability.
- **Expect:** You see the top five cards. Only the non-Human creature cards (Grizzly Bears, Hill Giant) can be picked, and you may pick none. Your pick enters the battlefield; the rest go on the bottom in a random order.

### Kinnan: Llanowar Elves alone casts Grizzly Bears
- **Do:** Cast Grizzly Bears, with only Llanowar Elves to pay.
- **Expect:** It's cast: the auto-payer counts Kinnan's extra mana.

### Deathrite Shaman: the land ability asks a colour as it resolves
- **Do:** Activate Deathrite's first ability targeting the Forest in Bob's graveyard. Let it resolve and pick red.
- **Expect:** No colour is offered when you activate it, and it goes on the stack. On resolution a prompt 'Deathrite Shaman — choose one' shows five buttons, 'Add {W}.' to 'Add {G}.'. Red exiles the land and adds {R}.

### Deathrite Shaman: no mana if the land is already gone
- **Do:** Activate one Deathrite's first ability targeting the Forest in Bob's graveyard. In response, activate your other Deathrite's on the same Forest.
- **Expect:** The second one resolves first and asks for a colour. The first then does nothing: no colour prompt, no mana.

### Deathrite Shaman: the auto-payer never uses it
- **Do:** Try to cast Grizzly Bears with the Forest and Deathrite Shaman untapped.
- **Expect:** The auto-payer never taps Deathrite Shaman to pay for the Bears.

### Deathrite Shaman: the {B} ability drains
- **Do:** Activate Deathrite's {B} ability targeting the Lightning Bolt in Bob's graveyard.
- **Expect:** The Bolt is exiled and Bob loses 2 life.

### Deathrite Shaman: the {G} ability gains life
- **Do:** Activate Deathrite's {G} ability targeting the Hill Giant in Bob's graveyard.
- **Expect:** The Hill Giant is exiled and you gain 2 life.

### Culling Ritual: what it destroys and the mana it adds
- **Do:** Cast Culling Ritual.
- **Expect:** It destroys Llanowar Elves, Grizzly Bears and both Soldier tokens (four), but not Darksteel Relic, either Gray Merchant or any land. Then one prompt with five buttons, 'Add {B}{B}{B}{B}.' to 'Add {G}{G}{G}{G}.', mixes included.

### Burnt Offering: mana equal to the sacrificed creature's mana value
- **Do:** Cast Burnt Offering, sacrificing Gray Merchant of Asphodel.
- **Expect:** You choose the sacrifice as you cast it. On resolution six buttons, from 'Add {B}{B}{B}{B}{B}.' to 'Add {R}{R}{R}{R}{R}.'.

### Burnt Offering: a token gives no mana
- **Do:** Cast Burnt Offering, sacrificing the Soldier token.
- **Expect:** No prompt and no mana.

### Klauth: X is counted as the trigger resolves
- **Do:** Attack with Klauth and Grizzly Bears. With Klauth's trigger on the stack, Lightning Bolt your own Bears.
- **Expect:** The trigger uses the stack. The prompt asks for 4 mana (Klauth only), not 6.

### Klauth: the split prompt
- **Do:** Attack with Klauth. In the prompt, try typing more into a field than is left, and try Max.
- **Expect:** One prompt, "Add 4 mana in any combination": a row per colour with its mana symbol, − / field / + / Max, and a running total. Max puts everything left into that colour and greys out once nothing is left. No field goes past what's left. "Add mana" is enabled only at 4/4, and the pool in your player header shows exactly what you picked.

### Klauth: the mana lasts into the second main phase
- **Do:** Attack with Klauth and put at least {U} in the split. Move to your postcombat main and cast Opt with the floating mana.
- **Expect:** The mana is still there after combat and pays for Opt.

### Klauth: the mana can't pay for an ability
- **Do:** Attack with Klauth and take the mana. In postcombat main, try Mind Stone's draw ability using only that mana.
- **Expect:** It can't be paid with Klauth's mana.
- **Not a bug:** The pool doesn't show the spells-only restriction.

### Klauth: the mana is gone by the next turn
- **Do:** Attack with Klauth, take the mana and spend none. Pass to the next turn.
- **Expect:** The mana is gone.

### Gwenna: two mana in any combination
- **Do:** Click Gwenna, Eyes of Gaea and read her menu.
- **Expect:** 15 readable entries, one per two-mana combination.

### Gwenna: her mana won't cast a noncreature spell
- **Do:** Tap Gwenna for {U}{U}, then try to cast Opt.
- **Expect:** Opt can't be paid with Gwenna's mana.

### Gwenna: her mana won't pay a land's ability
- **Do:** Tap Gwenna for two mana, then try Nykthos's {2} ability.
- **Expect:** Gwenna's mana can't pay it.

### Gwenna: her mana pays a creature's ability
- **Do:** Tap Gwenna for {B}{G}, then activate Deathrite Shaman's {B} ability on the Lightning Bolt in Bob's graveyard.
- **Expect:** Gwenna's {B} pays for it.

### Gwenna: a small creature spell does nothing
- **Do:** Cast Gray Merchant of Asphodel (power 2) using Gwenna and the Swamps.
- **Expect:** Gwenna gets no counter and doesn't untap.

### Gwenna: a power-6 creature spell grows and untaps her
- **Do:** Cast Alpha Tyrranax using Gwenna's mana and the Forests.
- **Expect:** Gwenna gets a +1/+1 counter and untaps.

### Reflecting Pool: a tapped Forest still counts
- **Do:** Click Reflecting Pool and read its menu, then tap it for {C}.
- **Expect:** It offers exactly {G} and {C}; Bob's Mountain gives nothing. Picking {C} adds {C}.

### Reflecting Pool: two Pools alone make nothing
- **Do:** Click either Reflecting Pool.
- **Expect:** One '(add no mana)' entry, and it can still be tapped for nothing.
- **Not a bug:** Two Reflecting Pools don't help each other; that's the card's ruling.

### Reflecting Pool: reads through Exotic Orchard
- **Do:** Click Reflecting Pool (Bob controls a Swamp).
- **Expect:** It offers {B}.

### Incubation Druid: all five colours from your lands
- **Do:** Click Incubation Druid and read its menu.
- **Expect:** All five colours are offered, even with no artifact for Spire of Industry and no charge counters on Vivid Grove.

### Incubation Druid: after adapt, three of one type
- **Do:** Activate adapt ({3}{G}{G}), then read Incubation Druid's menu.
- **Expect:** Each entry makes three of one type ('(add {G}{G}{G})'), never a mix.

### Incubation Druid: adapt with counters does nothing
- **Do:** Activate adapt ({3}{G}{G}) on the Druid that already has three +1/+1 counters.
- **Expect:** It gets no more counters.

### Gond Gate: no Gates, no colour
- **Do:** Click Gond Gate.
- **Expect:** Its colour ability offers only '(add no mana)'; the Forest doesn't count.

### Gond Gate: another Gate enters untapped and adds its colours
- **Do:** Play Azorius Guildgate, then click Gond Gate.
- **Expect:** Azorius Guildgate enters untapped. Gond Gate now offers {W} and {U}.

### Cactus Preserve: as big as your commander's mana value
- **Do:** Activate Cactus Preserve's {3} ability (Klauth, Unrivaled Ancient is in your command zone).
- **Expect:** It becomes a 7/7 green Plant land creature with reach.

### Horizon of Progress: pay 1 life per tap
- **Do:** Tap Horizon of Progress for mana by hand.
- **Expect:** It offers {G} and {C}, and tapping it costs 1 life.

### Reflecting Pool: tapped for no mana, Wild Growth adds nothing
- **Do:** Click Reflecting Pool (no other lands) and activate its '(add no mana)' entry.
- **Expect:** The only entry is '(add no mana)'. The Pool taps and your pool stays empty: no {G} from Wild Growth, no extra from Mirari's Wake.

### The Grey Havens: tapped for no mana, Fertile Ground adds nothing
- **Do:** Click The Grey Havens and activate its coloured ability's '(add no mana)' entry.
- **Expect:** A single '(add no mana)' entry, not a five-colour list from Fertile Ground. It taps and your pool stays empty, with no extra from Mirari's Wake.

### The Grey Havens: tapped for {C}, Fertile Ground adds a colour
- **Do:** Tap The Grey Havens for {C}.
- **Expect:** Fertile Ground offers a colour, and you get {C} plus that colour.

### Kinnan: an empty Chrome Mox gets no extra mana
- **Do:** Click Chrome Mox (nothing imprinted) and activate its '(add no mana)' entry.
- **Expect:** The only entry is '(add no mana)'. It taps and your pool stays empty: no extra from Kinnan.

### Mox Amber: tapped for no mana
- **Do:** Click Mox Amber (no legendary creature or planeswalker) and activate its '(add no mana)' entry.
- **Expect:** The only entry is '(add no mana)'. It taps and your pool stays empty.

### Mana Flare: an opponent's Flare doubles your land
- **Do:** Tap your Forest by hand (Bob controls Mana Flare).
- **Expect:** You get {G}{G}. Bob's pool is untouched.

### Mana Flare: you pick the extra for a two-mana land
- **Do:** Click Azorius Chancery (Bob controls Mana Flare).
- **Expect:** Two entries: {W}{U} plus a {W}, or {W}{U} plus a {U}.

### Mana Flare: one Forest casts Grizzly Bears
- **Do:** Cast Grizzly Bears with only the Forest (Bob controls Mana Flare).
- **Expect:** One Forest pays {1}{G}: the auto-payer counts the extra.

### Mana Flare: the opponent's land doubles too
- **Do:** Switch to Bob and tap his Mountain for mana by hand.
- **Expect:** Bob gets {R}{R}.

### Mana Flare: Cavern of Souls' extra mana isn't restricted
- **Do:** Play Cavern of Souls naming Bear. Tap it for {G} with its coloured ability, then cast Giant Growth on Grizzly Bears.
- **Expect:** Giant Growth can be paid with the extra {G} Mana Flare added.

### Heartbeat of Spring: an opponent's Heartbeat doubles your land
- **Do:** Tap your Forest by hand (Bob controls Heartbeat of Spring).
- **Expect:** You get {G}{G}, just as with Mana Flare.

### Mana Reflection: Wild Growth's extra isn't doubled
- **Do:** Tap the Forest enchanted with Wild Growth.
- **Expect:** {G}{G}{G}: the Forest's own {G} doubled, Wild Growth's not.

### Mana Reflection: Birds makes two of one colour
- **Do:** Click Birds of Paradise and read its menu.
- **Expect:** Five entries, each two of one colour ('(add {G}{G})' and so on), never a mix.

### Mana Reflection: Gilded Lotus makes six of one colour
- **Do:** Tap Gilded Lotus by hand.
- **Expect:** Six mana of the one colour you pick.

### Mana Reflection: both of Ancient Ziggurat's mana are creature-only
- **Do:** Tap Ancient Ziggurat by hand for blue, then try to cast Opt.
- **Expect:** You get two mana, and neither can pay for Opt.

### Mana Reflection: what one Birds can cast
- **Do:** Look at which spells in your hand you can cast, with only Birds of Paradise to pay.
- **Expect:** Plated Seastrider ({U}{U}) can be cast; Expressive Iteration ({U}{R}) can't.

### Nyxbloom Ancient: doublers and triplers multiply
- **Do:** Tap the Forest by hand (two Mana Reflections and Nyxbloom Ancient are out).
- **Expect:** One Forest makes 12 {G}.
- **Not a bug:** Big amounts show in the pool as a count plus one pip ('12{G}').

### Mana Reflection: an opponent's Reflection does nothing for you
- **Do:** Tap your Forest by hand (only Bob controls Mana Reflection).
- **Expect:** You get just {G}.

## Library ordering and cards chosen as a cost (2026-10-03, third round)

### Aragorn: scry 2 keeping both asks their order
- **Do:** Cast Opt. In Aragorn's scry 2 prompt (it resolves before Opt), keep both on top.
- **Expect:** A second popup, 'Put them back on top in the order you pick: the first you pick goes on top'. Picks are numbered, you must pick both, and your first pick ends on top. Opt's own scry 1 asks no order.

### Preordain: sending both to the bottom asks their order
- **Do:** Cast Preordain and send both cards to the bottom.
- **Expect:** A popup, 'Put them on the bottom in the order you pick: the last you pick goes on the very bottom'. Your last pick is the very bottom card.

### Preordain: the draw waits for the order
- **Do:** Cast Preordain, keep both on top, and order them.
- **Expect:** Preordain's draw happens only after you answer the order, and you draw the card you picked first.

### Preordain: one card each way asks no order
- **Do:** Cast Preordain, keeping one card on top and sending one to the bottom.
- **Expect:** No order popup at all.

### Doom Whisperer: surveil keeping two asks their order
- **Do:** Activate Doom Whisperer's surveil 2 and keep both cards on top.
- **Expect:** The same 'Put them back on top in the order you pick: the first you pick goes on top' popup. Cards you send to the graveyard just go there.

### Aragorn: two copies of one card ask no order
- **Do:** Cast Opt. In Aragorn's scry 2 prompt, keep both Grizzly Bears on top.
- **Expect:** No order popup: copies of one card are never ordered.

### Stock Up: the rest go to the bottom in your order
- **Do:** Cast Stock Up, take two cards, then order the rest.
- **Expect:** First an unnumbered pick for your hand. Then 'Put them on the bottom in the order you pick: the last you pick goes on the very bottom', numbered, needing all three leftovers. The library bottom matches your order.

### Dig Through Time: delved cards are exiled as you cast it
- **Do:** Cast Dig Through Time, paying {U}{U} with the Islands and delving all six graveyard cards. Take two.
- **Expect:** The six graveyard cards are exiled as you cast it. Only the five leftover cards are ordered.

### Experimental Augury: proliferate comes after the order
- **Do:** Cast Experimental Augury, take one card, order the other two.
- **Expect:** The proliferate prompt comes only after you've answered the order.

### Growing Rites: only creature cards can be taken
- **Do:** Cast Growing Rites of Itlimoc. Take Grizzly Bears and order the rest.
- **Expect:** Only creature cards can be picked; the others are shown but not pickable. The log reveals the taken creature to Bob, not the others. The three leftovers are then ordered.

### Growing Rites: taking nothing
- **Do:** Cast Growing Rites of Itlimoc and take nothing.
- **Expect:** Taking nothing is allowed, and then all four cards are ordered.

### Growing Rites: leftovers that are all one card ask no order
- **Do:** Cast Growing Rites of Itlimoc and take Grizzly Bears.
- **Expect:** No order popup: the three leftover Opts are copies of one card.

### Growing Rites: transforms with four creatures
- **Do:** Pass to your end step (you control four creatures).
- **Expect:** It transforms into Itlimoc, Cradle of the Sun, a land.

### Growing Rites: no trigger with three creatures
- **Do:** Pass to your end step (you control three creatures).
- **Expect:** Nothing triggers; it stays Growing Rites of Itlimoc.

### Growing Rites: losing a creature before it resolves
- **Do:** Pass to your end step. With the transform trigger on the stack, Shock your Grizzly Bears.
- **Expect:** The trigger does nothing; it stays Growing Rites of Itlimoc.

### Itlimoc: {G} for each creature you control
- **Do:** Pass to your end step so it transforms. Then tap Itlimoc, Cradle of the Sun for its second ability.
- **Expect:** It adds {G} for each creature you control ({G}{G}{G}{G}).

### Halimar Depths: put the top three back in your order
- **Do:** Play Halimar Depths.
- **Expect:** It enters tapped. 'Put them back on top in the order you pick: the first you pick goes on top' opens with all three cards, numbered, all three required. The library top then matches your order.
- **Not a bug:** Halimar Depths and Sensei's Divining Top ask for an order even when all three cards are the same.

### Sensei's Divining Top: {1} orders the top three
- **Do:** Activate Sensei's Divining Top's {1} ability.
- **Expect:** 'Put them back on top in the order you pick: the first you pick goes on top', all three cards numbered and required. The library top then matches your order.

### Sensei's Divining Top: {T} draws, then Top goes on top
- **Do:** Activate Sensei's Divining Top's {T} ability.
- **Expect:** You draw the top card first, then the Top is put on your library as its new top card.

### Valakut Awakening: two cards to the bottom, draw three
- **Do:** Cast Valakut Awakening. As it resolves, pick two of the three other cards in your hand.
- **Expect:** The popup comes on resolution, not on cast: 'Choose ... to put on the bottom of your library, in order: the last you pick goes on the very bottom', 0 to all your hand, picks numbered. The library bottom matches your order, and you draw three.

### Valakut Awakening: none to the bottom, draw one
- **Do:** Cast Valakut Awakening and pick no cards.
- **Expect:** You draw one card.

### Valakut Stoneforge: the land face
- **Do:** Play Valakut Awakening as its land face, Valakut Stoneforge.
- **Expect:** It's played as your land and enters tapped. Once untapped it taps for {R}.

### Teferi's Puzzle Box: the hand goes to the bottom, then redraw
- **Do:** Pass to your turn. In your draw step, answer the Puzzle Box prompt.
- **Expect:** You make your normal draw first. Then you must put all three cards on the bottom, picks numbered, titled '... in order: the last you pick goes on the very bottom'. Then you draw three. The library bottom matches your order.

### Teferi's Puzzle Box: an opponent's hand stays hidden
- **Do:** Pass to Bob's turn and watch his draw step.
- **Expect:** You only see that Bob is choosing ('look at cards'); his hand cards are never shown to you.

### Teferi's Puzzle Box: two Boxes trigger separately
- **Do:** Pass to your turn and answer the Puzzle Box prompts in your draw step.
- **Expect:** It happens twice, one Box after the other, each with its own put-back and redraw.

### Valakut Awakening: your commander can go to the command zone
- **Do:** Cast Valakut Awakening, pick Hill Giant and Krenko, Mob Boss (your commander), and answer 'Command zone'.
- **Expect:** After you confirm and before anything moves, a prompt 'Krenko, Mob Boss would go to your library — move it to the command zone instead?' with 'Command zone' / 'Put into library'. Krenko goes to the command zone, Hill Giant to the bottom, and you draw two.

### Valakut Awakening: your commander can go into the library
- **Do:** Cast Valakut Awakening, pick Hill Giant and Krenko, Mob Boss (your commander), and answer 'Put into library'.
- **Expect:** Both go to the bottom in your pick order, and you draw three.

### Brainstorm: your commander put back on top
- **Do:** Cast Brainstorm. Put back Hill Giant and Krenko, Mob Boss (your commander), and answer 'Put into library'.
- **Expect:** Krenko goes back on top of your library where you picked it.

### Brainstorm: your commander to the command zone instead
- **Do:** Cast Brainstorm. Put back Hill Giant and Krenko, Mob Boss (your commander), and answer 'Command zone'.
- **Expect:** Krenko goes to the command zone, and Hill Giant alone is put on top.

### Teferi's Puzzle Box: an opponent's commander
- **Do:** Pass to Bob's turn. In his draw step, Switch to Bob, put his whole hand on the bottom, and answer 'Command zone' for Teysa Karlov.
- **Expect:** Bob gets the commander prompt, not you. Teysa goes to the command zone, and Bob draws one fewer card than he had in hand.

### Moorland Haunt: exiling a creature card as a cost
- **Do:** Activate Moorland Haunt's Spirit ability and pick a creature card.
- **Expect:** The ability goes on the stack, then a 'Choose N card(s) to exile' popup shows your whole graveyard, but only creature cards can be picked (the Wastes is visible but not pickable); exactly one is required. It's exiled right away, before the ability resolves. You get a 1/1 flying Spirit.

### Moorland Haunt: one creature card is exiled without asking
- **Do:** Activate Moorland Haunt's Spirit ability (one creature card in your graveyard).
- **Expect:** Grizzly Bears is exiled without a popup.

### Moorland Haunt: no creature card, no ability
- **Do:** Click Moorland Haunt (no creature card in your graveyard).
- **Expect:** The Spirit ability isn't offered.

### Mines of Moria: three cards for two Treasures
- **Do:** Activate Mines of Moria's Treasure ability and pick three graveyard cards.
- **Expect:** The three are exiled at once, before the ability resolves. You get two Treasures.

### Varina: two cards for a Zombie
- **Do:** Activate Varina, Lich Queen's {2} ability and pick two graveyard cards.
- **Expect:** You get a tapped 2/2 Zombie.

### Psychic Frog: three cards for flying
- **Do:** Activate Psychic Frog's flying ability and pick three graveyard cards.
- **Expect:** Psychic Frog has flying until end of turn.

### Drivnod: three creature cards for an indestructible counter
- **Do:** Activate Drivnod's counter ability, paying one {B/P} with a Swamp and one with 2 life. Pick three creature cards.
- **Expect:** Only creature cards can be picked (Wastes and Opt are not). Drivnod gets an indestructible counter.

### Mines of Moria: enters tapped without a legendary creature
- **Do:** Play Mines of Moria.
- **Expect:** It enters tapped.

### Mines of Moria: enters untapped with a legendary creature
- **Do:** Play Mines of Moria (you control Varina, Lich Queen).
- **Expect:** It enters untapped.

### Mines of Moria: a second copy and the legend rule
- **Do:** Play the Mines of Moria in your hand while another is on the battlefield.
- **Expect:** The legend rule applies: you keep only one.

### Key to the City: up to one target
- **Do:** Activate Key to the City (discard Opt) targeting Grizzly Bears, then attack with the Bears.
- **Expect:** The target step has a Skip button. Grizzly Bears can't be blocked this turn.

### Key to the City and Pilferer: untap triggers wait for the upkeep
- **Do:** Pass to your turn (Key to the City and Ghostly Pilferer are tapped).
- **Expect:** Both untap in your untap step, but their triggers go on the stack in your upkeep. Each asks 'Pay {2} to draw a card?' Yes/No, and paying once draws exactly one card.

### Key to the City: no Yes without {2}
- **Do:** Pass to your turn (Key to the City is tapped, and you have no lands).
- **Expect:** The 'Pay {2} to draw a card?' prompt doesn't offer Yes.

### Key to the City: untapped by an effect
- **Do:** Activate Key to the City (discard Opt, Skip the target). Then untap it with Voltaic Key.
- **Expect:** Its trigger asks 'Pay {2} to draw a card?'.

### Ghostly Pilferer: discard to be unblockable
- **Do:** Activate Ghostly Pilferer's 'Discard a card', then attack with it.
- **Expect:** It can't be blocked this turn.
- **Not a bug:** Activating it after Pilferer is already blocked doesn't unblock it.

### Sensei's Divining Top: {T} in response to {1}
- **Do:** Activate Sensei's Divining Top's {1}. With it on the stack, activate {T}. Let both resolve.
- **Expect:** {T} resolves first: you draw, and the Top goes on top of your library. Then {1} resolves, and the Top itself is among the three cards you look at and order.

### Sensei's Divining Top: bounced in response, stays in hand
- **Do:** Activate Sensei's Divining Top's {T}. In response, cast Unsummon on the Top.
- **Expect:** You still draw a card, and the Top stays in your hand; it isn't put on your library.

### Psychic Frog: you keep priority after the discard
- **Do:** In Bob's upkeep, activate Psychic Frog's 'Discard a card' and pick the card.
- **Expect:** You still hold priority with the ability on the stack: your Pass and action controls show, and Bob isn't prompted. You can activate Frog again before anything resolves.

### Moorland Haunt: you keep priority after choosing the card
- **Do:** In Bob's upkeep, activate Moorland Haunt and pick the creature card to exile.
- **Expect:** You still hold priority with the ability on the stack: your Pass and action controls show, and Bob isn't prompted.

### Thrill of Possibility: you keep priority after the discard
- **Do:** In Bob's upkeep, cast Thrill of Possibility and pick its extra discard.
- **Expect:** You still hold priority with the spell on the stack: your Pass and action controls show, and Bob isn't prompted.

### Mesmeric Orb: the opponent mills in the upkeep, one per token
- **Do:** Pass to Bob's turn.
- **Expect:** In his upkeep (not the untap step) eight Orb triggers resolve and Bob mills 8: three lands plus one for each of the five tokens in the stack. You mill nothing.

### Mesmeric Orb: a land entering untapped mills nothing
- **Do:** Play Steam Vents and pay 2 life.
- **Expect:** It enters untapped, and nobody mills.

### Mesmeric Orb: one token untapped mills one
- **Do:** Cast Twiddle to untap one Soldier token from your tapped stack.
- **Expect:** You mill exactly one card.

### Mesmeric Orb: the controller mills, not the owner
- **Do:** Cast Act of Treason on Bob's tapped Grizzly Bears. With the Orb trigger on the stack, cast Unsummon on the Bears.
- **Expect:** The Bears go to Bob's hand, and you, not Bob, mill the card.

### Aragorn: a red spell deals 3 to the opponent you choose
- **Do:** Cast Lightning Bolt at Bob.
- **Expect:** Aragorn's trigger asks which opponent to target (Bob or Carol, never you) and deals 3 to them, on top of the Bolt's 3. The trigger resolves before the Bolt.

### Aragorn: a green spell's +4/+4
- **Do:** Cast Giant Growth on Grizzly Bears, and target the Bears with Aragorn's trigger.
- **Expect:** Aragorn's trigger asks for a target creature. The Bears end at 9 power (2 + 3 + 4).

### Aragorn: a red and white spell triggers twice
- **Do:** Turn on Settings → 'Order my own triggers'. Cast Boros Charm, 4 damage to Bob.
- **Expect:** Two triggers, a 1/1 Human Soldier token and 3 damage, and you choose their order. Both resolve before the Charm.

### Varina: one trigger for all attacking Zombies
- **Do:** Attack with Varina, Cemetery Reaper and Grizzly Bears. Answer the discard prompt.
- **Expect:** One trigger, not one per Zombie: draw 2, then discard 2 of your choice, and gain 2 life. Varina counts; the Bears don't.

### Varina: a Zombie that leaves still counts
- **Do:** Attack with Varina and Cemetery Reaper. With the trigger on the stack, Shock your Cemetery Reaper.
- **Expect:** The trigger still counts two Zombies: draw 2, discard 2, gain 2 life.

### Drivnod: death triggers happen twice
- **Do:** Sacrifice Grizzly Bears to Viscera Seer. Target Bob with each Blood Artist trigger.
- **Expect:** Zulaport Cutthroat and Blood Artist each trigger twice: Bob loses 4 and you gain 4. Each Blood Artist trigger asks its own target.

### Drivnod: sacrifice triggers happen once
- **Do:** Sacrifice Grizzly Bears to Viscera Seer.
- **Expect:** Lightless Evangel triggers once (one +1/+1 counter), and Viscera Seer's scry 1 happens once.

### Nezahal and Pilferer: a spell cast from hand
- **Do:** Switch to Bob and cast Lightning Bolt from his hand.
- **Expect:** Nezahal's trigger draws you a card; Ghostly Pilferer's doesn't. The draw resolves before the Bolt.

### Nezahal and Pilferer: a spell cast by flashback
- **Do:** Switch to Bob and cast Faithless Looting from his graveyard by flashback.
- **Expect:** Both Nezahal and Ghostly Pilferer draw you a card, before the Looting resolves.

### Nezahal and Pilferer: a commander cast from the command zone
- **Do:** Switch to Bob and cast his commander, Teysa Karlov, from the command zone.
- **Expect:** Ghostly Pilferer draws you a card; Nezahal doesn't. The draw resolves before Teysa.

### Nezahal: the blink returns tapped, without counters
- **Do:** Activate Nezahal's ability, choosing which three of your four cards to discard. Pass to your end step.
- **Expect:** Nezahal is exiled at once and comes back at the beginning of the end step, tapped and without its +1/+1 counter.

### Nezahal: activated in an end step, back next end step
- **Do:** In your end step, activate Nezahal's ability.
- **Expect:** It doesn't return this end step; it comes back at the beginning of the next turn's end step.

## Infect, wither, spree and gift (2026-10-03, third round)

### Three Steps Ahead: the counter mode is greyed out with no spell
- **Do:** With nothing on the stack, start casting Three Steps Ahead and look at the mode chooser, then Cancel.
- **Expect:** The chooser reads 'Three Steps Ahead — choose 1–N', N being the most modes you can pay for, and each mode button shows its cost in mana symbols. 'Counter target spell' is greyed out (nothing to target). Copy and draw together are allowed.

### Three Steps Ahead: two modes picked grey out the third
- **Do:** Cast Shock at Bob. With Shock on the stack, start casting Three Steps Ahead: pick one mode, then a second.
- **Expect:** After one pick the other two modes stay open. After two, the third greys out, because all three would cost 9 and you have 6 lands. Confirm stays disabled until the picks are a set you can pay for.

### Three Steps Ahead: counter and draw resolve in printed order
- **Do:** Cast Shock at Bob. With Shock on the stack, cast Three Steps Ahead with the counter and draw modes, targeting Shock. Discard a card when asked.
- **Expect:** Five lands tap and Shock is countered. You draw 2 and only then get the discard prompt.

### Three Steps Ahead: the copy is untapped with no counter
- **Do:** Cast Three Steps Ahead with only the copy mode, targeting your tapped Grizzly Bears (it has a +1/+1 counter).
- **Expect:** The token is an untapped 2/2 Grizzly Bears with no counter.

### Three Steps Ahead: one Island can't pay the counter mode
- **Do:** Cast Shock at Bob (with your Mountain). With Shock on the stack, start casting Three Steps Ahead and look at the mode chooser.
- **Expect:** 'Counter target spell' is greyed out: it needs two blue and you have one Island, even though you have 6 mana.

### Insatiable Avarice: the search must find a card
- **Do:** Cast Insatiable Avarice with only the first mode (search). Try to confirm without picking, then pick a card from the middle of the list.
- **Expect:** The search lists every card in your library. There is no 'find nothing' option and Confirm needs a card. The chosen card ends up on top of your library, not in your hand.

### Insatiable Avarice: the found card is among the three drawn
- **Do:** Cast Insatiable Avarice with both modes, targeting yourself for the draw. Pick a card from the middle of the library.
- **Expect:** The library shuffles and the chosen card goes on top, then the three cards you draw include it. Your life goes to 17.

### Insatiable Avarice: the opponent doesn't see the found card
- **Do:** Cast Insatiable Avarice with only the first mode and pick a card. Then Switch to Bob.
- **Expect:** Neither Bob's view nor his log reveals which card you chose.

### Insatiable Avarice: the draw mode on the opponent
- **Do:** Cast Insatiable Avarice with only the second mode, targeting Bob.
- **Expect:** Bob draws 3 and goes to 17 life. Your library is untouched.

### Smuggler's Surprise: the mill pick offers only creatures and lands
- **Do:** Cast Smuggler's Surprise with only the first mode (mill four).
- **Expect:** The pick offers only Craw Wurm, Forest and Grizzly Bears: not the milled Sol Ring, and not the Hill Giant already in your graveyard. It allows 0–2 picks.

### Smuggler's Surprise: a milled creature can go onto the battlefield
- **Do:** Cast Smuggler's Surprise with the first two modes. From the milled cards take Craw Wurm and Forest, then look at the second mode's prompt.
- **Expect:** The second mode offers only the creature cards in your hand, Serra Angel and the Craw Wurm you just took (not the Forest). It allows 0–2.

### Smuggler's Surprise: only the big creatures get protection
- **Do:** Cast Smuggler's Surprise with all three modes. Take Craw Wurm and Forest from the milled cards, then put Craw Wurm and Serra Angel onto the battlefield.
- **Expect:** Craw Wurm (6/4) and Serra Angel (4/4) gain hexproof and indestructible. Your 2/2 Grizzly Bears gets nothing.

### Requisition Raid: all three modes, targeting yourself
- **Do:** Cast Requisition Raid with all three modes: target Bob's Sol Ring, Carol's Pacifism, and yourself as the player.
- **Expect:** It costs 4. The target prompts come in mode order: artifact, then enchantment, then player. Sol Ring and Pacifism are destroyed, and only your creatures get a +1/+1 counter.

### Requisition Raid: counters go on the targeted player's creatures
- **Do:** Cast Requisition Raid with only the third mode, targeting Carol.
- **Expect:** Any player can be targeted, you included. A +1/+1 counter goes on each of Carol's creatures and on no one else's.

### Dawn's Truce: two cast buttons, the gift costs nothing
- **Do:** Open the cast options for Dawn's Truce.
- **Expect:** There are two buttons, 'Cast Dawn's Truce' and 'Cast Dawn's Truce (gift)'. The gift button shows no mana symbol, because a gift costs nothing.

### Dawn's Truce: the gift question
- **Do:** Click 'Cast Dawn's Truce (gift)'. Look at the question, then pick Carol with her 'Promise the gift to …' button.
- **Expect:** It asks once: 'Dawn's Truce — choose one', with a 'Promise the gift to …' button per opponent in turn order from your left, and the opponents' panels lit. There is no "none" answer. The log reads 'You promise Dawn's Truce's gift to' Carol.

### Dawn's Truce: promised, the gift comes first, then indestructible
- **Do:** Cast the gift version, promise it to Carol, and let it resolve.
- **Expect:** Carol draws a card first. Then you have hexproof, and every permanent you control (lands and Sol Ring too) has hexproof and indestructible until end of turn.

### Dawn's Truce: promising the gift by clicking a player panel
- **Do:** Cast the gift version and, when asked, click Dave's player panel.
- **Expect:** Dave is picked: the log reads 'You promise Dawn's Truce's gift to' Dave.

### Dawn's Truce: a countered spell gives no gift
- **Do:** Cast the gift version promised to Bob. With it on the stack, Counterspell it yourself.
- **Expect:** Dawn's Truce is countered and Bob draws no card.

### Dawn's Truce: unpromised, hexproof only
- **Do:** Cast the plain 'Cast Dawn's Truce' and let it resolve.
- **Expect:** You and your permanents get hexproof only, no indestructible. Nobody draws.

### Dawn's Truce: no gift question in a 2-player game
- **Do:** Cast the gift version.
- **Expect:** You aren't asked which opponent gets the gift.

### Dawn's Truce: a player who has lost isn't offered
- **Do:** Lightning Bolt Carol (she's at 3 life) so she loses. Then cast the gift version.
- **Expect:** The question offers only Bob and Dave, never Carol.

### Dawn's Truce: a promised player who leaves gets nothing
- **Do:** Cast the gift version promised to Carol (she's at 3 life). With it on the stack, Lightning Bolt Carol.
- **Expect:** Carol loses, and when Dawn's Truce resolves nobody draws the gift card.

### Into the Flood Maw: only the gift cast with no opposing creature
- **Do:** Open the cast options for Into the Flood Maw (Bob has no creatures).
- **Expect:** Only the '(gift)' cast is offered.

### Into the Flood Maw: promised, it bounces a nonland permanent
- **Do:** Cast Into the Flood Maw with the gift. Look at the targets, then pick Sol Ring.
- **Expect:** It can target Sol Ring or Rhystic Study, never a land. Bob gets a tapped 1/1 blue Fish first, then Sol Ring returns to his hand.

### Long River's Pull: only the gift cast counters a noncreature spell
- **Do:** Cast Opt. With Opt on the stack, open the cast options for Long River's Pull.
- **Expect:** Only the gift version can target Opt.

### Wear Down: no gift cast with only one target
- **Do:** Open the cast options for Wear Down (Bob has only Sol Ring).
- **Expect:** The gift version isn't offered: promised, it needs two different artifacts or enchantments.

### Wear Down: promised, it destroys two at once
- **Do:** Cast Wear Down with the gift, targeting Bob's Sol Ring and Rhystic Study.
- **Expect:** Bob draws, then both are destroyed together.

### Peerless Recycling: only permanent cards are targets
- **Do:** Cast Peerless Recycling with the gift and look at the targets.
- **Expect:** Grizzly Bears and Sol Ring are offered, never Lightning Bolt. Promised, it takes two different cards.

### Sazacap's Brew: unpromised, it targets only a player
- **Do:** Cast Sazacap's Brew without the gift (you have no creature).
- **Expect:** It targets only a player, with no creature needed. The discard cost is asked as a prompt after you cast.

### Sazacap's Brew: promised, it also pumps your creature
- **Do:** Cast Sazacap's Brew with the gift, targeting a player and your Grizzly Bears.
- **Expect:** It targets a player plus a creature you control, and the Bears gets +2/+0.

### Sazacap's Brew: not castable as your only card
- **Do:** Try to cast Sazacap's Brew, the only card in your hand.
- **Expect:** It can't be cast: there's no other card to discard.

### Octomancer: the gift Octopus is copied at your end step
- **Do:** Cast Octomancer with the gift. Pass to your end step.
- **Expect:** As it enters, Bob gets an 8/8 blue Octopus token. At your end step the trigger targets 'creature token that entered this turn' and offers Bob's Octopus. You get an untapped 8/8 Octopus copy with no counters.

### Octomancer: it triggers at the opponent's end step too
- **Do:** Switch to Bob and cast Raise the Alarm. Pass to Bob's end step and go back to your seat.
- **Expect:** Octomancer triggers at Bob's end step, and you can target one of Bob's new Soldier tokens.

### Octomancer: no new token, no copy
- **Do:** Pass to your end step (no creature token entered this turn).
- **Expect:** The trigger has no target and does nothing.

### Final Showdown: indestructible outlasts losing all abilities
- **Do:** Cast Final Showdown with all three modes. When asked, choose your Grizzly Bears.
- **Expect:** During resolution you're asked 'Choose a creature you control to gain indestructible until end of turn' (a choice, not a target), offering only your creatures. Bears survives and Darksteel Myr is destroyed. Neither Doomed Traveler makes a Spirit.

### Final Showdown: abilities come back next turn
- **Do:** Cast Final Showdown with only the first mode. Look at Bob's Darksteel Myr, then again on the next turn.
- **Expect:** The Myr shows no indestructible icon until end of turn, and has it again next turn.

### Parting Gust: unpromised, the creature returns at the end step
- **Do:** Cast Parting Gust without the gift on Bob's Serra Angel (look at the targets first). Pass to your end step.
- **Expect:** The Soldier token is never offered as a target. The Angel is exiled and your Pacifism goes to the graveyard. At the beginning of the end step the Angel returns under Bob's control with a +1/+1 counter, no longer pacified.

### Parting Gust: your own creature returns and triggers again
- **Do:** Cast Parting Gust without the gift on your Wall of Omens. Pass to your end step.
- **Expect:** Wall of Omens returns at the end step and its enters trigger draws you a card again.

### Parting Gust: promised, the exile is for good
- **Do:** Cast Parting Gust with the gift on Bob's Hill Giant. Pass to your end step.
- **Expect:** Bob gets a tapped 1/1 Fish. Hill Giant stays in exile and nothing returns at the end step.

### Starfall Invocation: only a creature it killed comes back
- **Do:** Cast Starfall Invocation with the gift. At the graveyard choice, pick Wall of Omens.
- **Expect:** Bob draws first, then every creature is destroyed, and Bob gets a Spirit from Doomed Traveler. The choice offers only Hill Giant and Wall of Omens (not the Serra Angel already there, Bob's cards or the token), and you must take one. Wall returns under your control, and its draw trigger goes on the stack after the spell finishes.

### Coiling Rebirth: promised, the creature returns with a 1/1 copy
- **Do:** Cast Coiling Rebirth with the gift, targeting Wall of Omens in your graveyard.
- **Expect:** Bob draws, Wall of Omens returns, and you get a 1/1 token copy of it. Both draw triggers wait until the spell has resolved.

### Coiling Rebirth: a legendary creature gets no token
- **Do:** Cast Coiling Rebirth with the gift, targeting Skithiryx, the Blight Dragon in your graveyard.
- **Expect:** Skithiryx returns, but no token is made at all.

### Coiling Rebirth: unpromised, it only returns the creature
- **Do:** Cast Coiling Rebirth without the gift, targeting Hill Giant in your graveyard.
- **Expect:** Hill Giant returns and nothing else happens.

### Scrapshooter: promised, two enters triggers you order
- **Do:** Cast Scrapshooter with the gift. When it enters, order the triggers and pick a target.
- **Expect:** There are two enters triggers, the gift (Bob draws a card) and 'destroy target artifact or enchantment an opponent controls', and you order them. The target list holds only Bob's artifacts and enchantments.

### Scrapshooter: the gift is given even if it's exiled
- **Do:** Cast Scrapshooter with the gift. With both enters triggers on the stack, cast Swords to Plowshares on Scrapshooter.
- **Expect:** Bob still draws his card.

### Scrapshooter: promised with nothing to destroy
- **Do:** Cast Scrapshooter with the gift (Bob has no artifact or enchantment).
- **Expect:** It can be cast. Bob draws, and the destroy trigger simply doesn't happen.

### Scrapshooter: unpromised, no triggers
- **Do:** Cast Scrapshooter without the gift.
- **Expect:** Neither enters trigger happens.

### Inkmoth Nexus: animated, a 1/1 flying infect creature land
- **Do:** Activate Inkmoth Nexus's {1} ability.
- **Expect:** It becomes a 1/1 flying, infect artifact creature land, with the infect icon.

### Inkmoth Nexus: played this turn, it can't attack or tap
- **Do:** Play Inkmoth Nexus from your hand and activate its {1} ability. Try to attack with it, and try to tap it for {C}.
- **Expect:** It can't attack and can't tap for mana this turn.

### Blighted Agent: combat damage to a player is poison
- **Do:** Attack Bob with Blighted Agent.
- **Expect:** Bob's player panel shows his poison as '☠ 1/10' and his life stays 20.

### Plague Myr: infect damage to a planeswalker removes loyalty
- **Do:** Attack Ajani, Caller of the Pride with Plague Myr.
- **Expect:** Ajani loses loyalty, and gets no -1/-1 counters.

### Ichorclaw Myr: two blockers, one trigger, -1/-1 counters
- **Do:** Attack Bob with Ichorclaw Myr. Switch to Bob and block with both Wall of Wood and Hill Giant. Put at least 1 damage on Hill Giant, then pass to the next turn.
- **Expect:** Ichorclaw gets +2/+2 only once. Its damage to the blockers becomes -1/-1 counters, not marked damage, and Hill Giant's +1/+1 counter cancels out one -1/-1 counter. The counters are still there next turn.

### Phyresis: an infect ping kills through deathtouch
- **Do:** Ping Bob's Hill Giant with Prodigal Pyromancer (it has Phyresis and Basilisk Collar).
- **Expect:** Hill Giant gets one -1/-1 counter and is destroyed by deathtouch, even though no damage is marked.

### Phyresis: an infect ping on a player is poison, with lifelink
- **Do:** Ping Bob with Prodigal Pyromancer (it has Phyresis and Basilisk Collar).
- **Expect:** Bob gets 1 poison and loses no life. You gain 1 life from lifelink.

### Fling: an infect creature flung deals ordinary damage
- **Do:** Cast Fling at Bob, sacrificing your Grizzly Bears (it has Phyresis).
- **Expect:** Bob loses 2 life and gets no poison: the damage comes from Fling, which has no infect.

### Tainted Strike: the Bears deal poison in combat
- **Do:** Cast Tainted Strike on your Grizzly Bears, then attack Bob with it.
- **Expect:** The Bears becomes 3/2 with infect. Bob gets 3 poison and loses no life.

### Triumph of the Hordes: only your creatures get infect
- **Do:** Cast Triumph of the Hordes and look at both sides' creatures.
- **Expect:** Your Grizzly Bears gets +1/+1, trample and infect. Bob's Llanowar Elves gets nothing.

### Triumph of the Hordes: ten poison loses the game
- **Do:** Cast Triumph of the Hordes and attack Bob (at 6 poison) with both Grizzly Bears.
- **Expect:** The combat damage is poison. At 10 poison Bob loses, and the game-over reason mentions poison.

### Skithiryx: infect damage still counts as commander damage
- **Do:** Cast Skithiryx from the command zone, pay {B} to give it haste, and attack Bob.
- **Expect:** Bob gets 4 poison and his life doesn't change. The 4 damage still counts as commander damage from Skithiryx.

### Skithiryx: an infect blocker dies and it regenerates
- **Do:** Activate Skithiryx's {B}{B} regenerate ability, then attack Bob. Switch to Bob and block with Craw Wurm.
- **Expect:** Craw Wurm gets four -1/-1 counters and dies. Skithiryx takes lethal damage and is regenerated instead: tapped, removed from combat, damage removed.

### Massacre Girl: a pinged Elves draws, makes a Snake, returns
- **Do:** Ping Bob's Llanowar Elves with Prodigal Pyromancer. Answer Yes when Necroskitter asks.
- **Expect:** The Elves gets a -1/-1 counter and dies at 0/0. You draw a card (Massacre Girl), Hapatra makes a deathtouch Snake, and Necroskitter asks 'Return that card to the battlefield under your control?'. On Yes the Elves comes back under your control with no counter.

### Massacre Girl: wither doesn't touch players
- **Do:** Ping Bob with Prodigal Pyromancer.
- **Expect:** Bob loses 1 life as usual.

### Massacre Girl: wither in combat
- **Do:** Attack Bob with your Grizzly Bears. Switch to Bob and block with Hill Giant.
- **Expect:** Hill Giant gets two -1/-1 counters and survives as a 1/1. Your Bears dies of ordinary damage.

### Necroskitter: a dead token doesn't come back
- **Do:** Ping Bob's Soldier token with Prodigal Pyromancer.
- **Expect:** The token dies and nothing comes back to you.

### Massacre Girl: a creature with no counters gives nothing
- **Do:** Cast Doom Blade on Bob's Grizzly Bears.
- **Expect:** It dies with no counter on it: no card draw and no Necroskitter trigger.

### Midnight Banshee: upkeep counters skip black creatures
- **Do:** Pass from Bob's end step into your upkeep.
- **Expect:** Midnight Banshee puts a -1/-1 counter on each nonblack creature, your Grizzly Bears and Bob's Hill Giant. None goes on Massacre Girl, Necroskitter or Banshee.

### Phyrexian Swarmlord: an Insect per opponent poison counter
- **Do:** Pass from Dave's end step into your upkeep.
- **Expect:** Swarmlord makes 5 green 1/1 Phyrexian Insect tokens with infect: Bob's 3 poison plus Carol's 2, never your own. They show as one token stack, each with the infect icon.

### Phyrexian Swarmlord: each Insect attacks on its own
- **Do:** Pass into your upkeep to make the Insects. On your following turn, attack with only two of them.
- **Expect:** Each Insect can be declared as an attacker (or blocker) on its own, out of the stack.

### Ichor Rats: both players at ten poison is a draw
- **Do:** Cast Ichor Rats (you and Bob are both at 9 poison).
- **Expect:** Both players reach 10 poison at once and the game is a draw.

## Notion Thief, copied abilities, a departed player's permanents (2026-10-03, third round)

### Strionic Resonator: an activated ability can't be copied
- **Do:** Activate Prodigal Sorcerer at Bob. With its ability on the stack, try to activate Strionic Resonator.
- **Expect:** The Resonator isn't offered: an activated ability isn't a legal target.

### Strionic Resonator: copying a trigger with no targets
- **Do:** Cast Elvish Visionary. With its enters trigger on the stack, activate Strionic Resonator targeting the trigger.
- **Expect:** The trigger can be picked as the target. No new-targets prompt appears, and you draw 2 cards in total.

### Strionic Resonator: a copied Banishing Light trigger stays linked
- **Do:** Cast Banishing Light targeting Bob's Grizzly Bears. With the trigger on the stack, copy it with Strionic Resonator and choose Bob's Llanowar Elves as the copy's new target. Then cast Naturalize on Banishing Light.
- **Expect:** The copy asks for new targets, and both the Bears and the Elves end up exiled. When Banishing Light is destroyed, both return.

### Strionic Resonator: a Saga chapter can be copied
- **Do:** Cast History of Benalia and copy its chapter I trigger with Strionic Resonator.
- **Expect:** You get two Knight tokens.

### Strionic Resonator: an opponent's trigger isn't offered
- **Do:** Switch to Bob and cast Elvish Visionary. With its trigger on the stack, go back to your seat and try to activate Strionic Resonator.
- **Expect:** Bob's trigger isn't offered: the Resonator copies only a trigger you control.

### Strionic Resonator: the copy asks Flameshadow's payment again
- **Do:** Cast Grizzly Bears. With Flameshadow Conjuring's trigger on the stack, copy it with Strionic Resonator. Pay {R} for both.
- **Expect:** The copy asks 'Pay {R}…?' again on its own. Paying both gives you two token Bears.
- **Not a bug:** The tokens are exiled at the end step without anything going on the stack, so the Resonator can't copy that.

### Peter Parker's Camera: enters with three film counters
- **Do:** Cast Peter Parker's Camera.
- **Expect:** It enters with 3 film counters, shown on the card.

### Peter Parker's Camera: copying a ping the turn it arrives
- **Do:** Cast the Camera. Activate Prodigal Sorcerer at Bob, and in response activate the Camera ({2}, tap, remove a film counter) targeting the Sorcerer's ability. Choose Bob's Llanowar Elves as the copy's new target.
- **Expect:** You can tap the Camera the turn it arrives (it isn't a creature), and it goes down to 2 film counters. The copy kills the Elves, and Bob takes 1 from the original.

### Peter Parker's Camera: a copy is never offered itself
- **Do:** Cast Elvish Visionary. With its trigger on the stack, activate Lithoform Engine's {2} ability targeting the trigger. Then activate the Camera targeting Lithoform's ability, and look at the new-targets prompt for the Camera's copy.
- **Expect:** The prompt offers the Visionary trigger and Lithoform's ability, but never the Camera's copy itself. Once everything resolves, the copies stack up and you draw extra cards.

### Peter Parker's Camera: no film counters, no activation
- **Do:** Activate Prodigal Sorcerer at Bob. With its ability on the stack, try to activate the Camera (it has no film counters).
- **Expect:** The Camera isn't offered.

### Battlemage's Bracers: haste lets a new Sorcerer tap
- **Do:** Cast Prodigal Sorcerer, equip Battlemage's Bracers to it ({2}), then activate the Sorcerer at Bob.
- **Expect:** The summoning-sick Sorcerer can use its {T} ability right away.

### Battlemage's Bracers: pay {1} to copy the ability
- **Do:** Activate the equipped Prodigal Sorcerer at Bob. When the Bracers trigger resolves, answer 'Pay {1} to copy that ability?' with yes, and give the copy Bob's Llanowar Elves.
- **Expect:** {1} is actually spent and the copy asks for new targets. Bob's Elves die and Bob takes 1.

### Battlemage's Bracers: declining copies nothing
- **Do:** Activate the equipped Prodigal Sorcerer at Bob. Decline 'Pay {1} to copy that ability?'.
- **Expect:** Nothing is copied and no mana is spent.

### Battlemage's Bracers: no copy offer without mana
- **Do:** Activate the equipped Prodigal Sorcerer at Bob (you have no untapped mana).
- **Expect:** The pay option isn't offered.

### Battlemage's Bracers: equip and mana abilities don't trigger it
- **Do:** Equip Battlemage's Bracers to your Llanowar Elves, then tap the Elves for mana.
- **Expect:** Neither the equip nor the mana ability triggers the Bracers.

### Increasing Vengeance: one copy from your hand
- **Do:** Lightning Bolt Bob. With it on the stack, cast Increasing Vengeance targeting the Bolt, and redirect the copy to Bob's Llanowar Elves.
- **Expect:** Exactly one new-targets prompt. The Elves die, Bob takes 3, and Increasing Vengeance goes to your graveyard.

### Increasing Vengeance: two copies when flashed back
- **Do:** Lightning Bolt Bob. With it on the stack, flash back Increasing Vengeance from your graveyard ({3}{R}{R}) targeting the Bolt. Give one copy Bob's Grizzly Bears and the other Bob.
- **Expect:** Two separate new-targets prompts, one per copy. All three Bolts resolve, and Increasing Vengeance is exiled.

### Frolicking Familiar: Essence Scatter can't counter the Adventure
- **Do:** Cast Blow Off Steam (Frolicking Familiar's Adventure) at Bob. With it on the stack, try to cast Essence Scatter on it.
- **Expect:** Essence Scatter can't target it: on the stack it's an instant spell, not a creature spell.

### Frolicking Familiar: copying Blow Off Steam
- **Do:** Cast Blow Off Steam (Frolicking Familiar's Adventure) at Bob, then copy it with Reverberate.
- **Expect:** The copy works: Bob takes 2 in total.

### Increasing Vengeance: a creature spell isn't a target
- **Do:** Cast Grizzly Bears. With it on the stack, try to cast Increasing Vengeance on it.
- **Expect:** The Bears spell isn't a legal target.

### Increasing Vengeance: an opponent's spell isn't a target
- **Do:** Switch to Bob and cast Lightning Bolt at you. Go back to your seat and try to cast Increasing Vengeance on it.
- **Expect:** Bob's Bolt isn't a legal target.

### Reverberate: copying a flashed-back Vengeance makes one copy
- **Do:** Lightning Bolt Bob. Flash back Increasing Vengeance targeting the Bolt, then with it on the stack cast Reverberate on Increasing Vengeance.
- **Expect:** The Reverberate copy of Increasing Vengeance makes only one Bolt copy, because the copy was never cast.

### Fling: a copy uses the sacrificed creature's power
- **Do:** Cast Fling at Bob, sacrificing your Grizzly Bears (power 2). Copy Fling with Reverberate.
- **Expect:** The copy also deals 2: what was paid for the original counts for the copy. Report it if the copy deals 0.

### Ixhel: only an opponent with three poison exiles a card
- **Do:** Pass straight to your end step without attacking.
- **Expect:** Ixhel's trigger goes on the stack. Only Bob (3 poison) exiles a card; Carol (2 poison) and you exile nothing.

### Ixhel: the exiled card is face down to its owner
- **Do:** Pass to your end step. Look at Bob's exile from your seat, then Switch to Bob and look again.
- **Expect:** Your seat sees the Lightning Bolt's face and is offered it. Bob's seat sees only a face-down card back.

### Ixhel: cast the exiled card with any colour of mana
- **Do:** Pass to your end step. On your next turn, cast the exiled Lightning Bolt paying with a Plains.
- **Expect:** The Bolt can be paid for with white mana.

### Ixhel: toxic in combat, then both opponents exile
- **Do:** Attack Carol with Ixhel, then go to your end step.
- **Expect:** Carol loses 2 life and gets 2 poison (now 4). At the end step Bob and Carol exile a card at once, as one exile.

### Ixhel: the cards stay playable after Ixhel leaves
- **Do:** Pass to your end step. On your next turn, cast Swords to Plowshares on Ixhel. Then play the exiled Mountain as your land for the turn, and cast the exiled Grizzly Bears.
- **Expect:** You can still look at and play both cards after Ixhel has left. The Mountain uses your land drop.

### Ixhel: an exiled creature card keeps its timing
- **Do:** Pass to your end step. After the exile, try to cast the exiled Grizzly Bears there. On your next turn, cast it in your main phase with the stack empty.
- **Expect:** It can't be cast in the end step, only in your main phase with an empty stack.

### Ixhel: an owner can't cast their own exiled card
- **Do:** Pass to your end step. On Bob's turn, Switch to Bob and try to cast his exiled Lightning Bolt.
- **Expect:** Bob can never cast it.

### Notion Thief: an upkeep draw goes to you
- **Do:** Pass to Bob's upkeep and let Phyrexian Arena's trigger resolve.
- **Expect:** You draw the card, not Bob, and Bob still loses 1 life.

### Notion Thief: the opponent keeps their first draw-step card
- **Do:** Pass to Bob's draw step.
- **Expect:** Bob keeps his normal draw for the turn. Howling Mine's extra card for Bob goes to you.

### Notion Thief: Faithless Looting draws for you, Bob discards
- **Do:** Switch to Bob and cast Faithless Looting.
- **Expect:** You draw the 2 cards, and Bob still has to discard 2.

### Notion Thief: one Thief each, the drawer keeps the cards
- **Do:** Switch to Bob (he has his own Notion Thief) and cast Divination.
- **Expect:** Bob draws both cards. The log shows two redirects per card.

### Notion Thief: your two Thieves beat Bob's one
- **Do:** Switch to Bob (he has one Notion Thief, you have two) and cast Divination.
- **Expect:** You draw both cards. The log shows three redirects per card.

### Notion Thief: Wheel of Fortune's draws all go to you
- **Do:** Switch to Bob and cast Wheel of Fortune.
- **Expect:** Bob discards his hand and draws nothing. All 7 of Bob's cards go to you, on top of your own 7.

### Notion Thief: your own draws aren't touched
- **Do:** Pass from Bob's end step to your draw step.
- **Expect:** You draw normally, and Bob's Howling Mine gives you your extra card as usual.

### Molten Echoes: the type prompt offers real types only
- **Do:** Cast Molten Echoes and look at the creature-type prompt.
- **Expect:** It offers only real creature types.

### Molten Echoes: an Elf is copied by both enchantments
- **Do:** Cast Molten Echoes and choose Elf. Cast Elvish Visionary, order the two triggers, and pay {R} for Flameshadow Conjuring's.
- **Expect:** You get two hasty token Visionaries, each drawing a card from its own enters trigger. The tokens entering don't trigger either enchantment.

### Flameshadow Conjuring: a non-Elf triggers only Flameshadow
- **Do:** Cast Molten Echoes and choose Elf. Then cast Grizzly Bears.
- **Expect:** Only Flameshadow Conjuring triggers.

### Flameshadow Conjuring: no red, no payment offered
- **Do:** Cast Molten Echoes with all four Mountains and choose Elf. Then cast Llanowar Elves with your Forest.
- **Expect:** With no red left, Flameshadow offers no payment. Molten Echoes still copies the Elves.

### Molten Echoes: the token attacks and is exiled at end step
- **Do:** Cast Molten Echoes and choose Elf. Cast Elvish Visionary, attack Bob with the token, then go to your end step.
- **Expect:** The token can attack this turn (haste). At the start of your end step it's exiled; the real Visionary stays.
- **Not a bug:** The exile happens silently as the end step begins, with nothing on the stack to respond to.

### Flameshadow Conjuring: a token made in an end step lasts a turn
- **Do:** In Bob's end step, flash in Briarpack Alpha and pay {R} for Flameshadow's copy. Let turns pass to your own end step.
- **Expect:** The token survives Bob's end step and is exiled at your next end step. The real Briarpack Alpha stays.

### Boseiju: the channel fizzles when its target's owner loses
- **Do:** Activate Boseiju's channel from your hand targeting Carol's Tarnished Citadel. With it on the stack, Lightning Bolt Carol (she's at 3 life).
- **Expect:** Carol's Citadel is offered as a target. Carol loses at once, then the channel does nothing because its only target left with her. Nobody is asked to search, and the game doesn't freeze waiting on Carol.

### Boseiju: a departed player's permanents aren't targets
- **Do:** Lightning Bolt Carol (she's at 3 life). Then start Boseiju's channel and look at the targets.
- **Expect:** Only Bob's Tarnished Citadel is offered. None of Carol's permanents is.
- **Not a bug:** Carol's cards stay visible on her side, out of the game.

### Lightning Bolt: a departed player's creature isn't a target
- **Do:** Lightning Bolt Carol (she's at 3 life). Then try to Bolt Carol's Grizzly Bears.
- **Expect:** Carol's Bears isn't offered as a target; Bob's Hill Giant is.

### Scavenging Ooze: a departed player's graveyard isn't a target
- **Do:** Lightning Bolt Carol (she's at 3 life). Then activate Scavenging Ooze and look at the targets.
- **Expect:** Only Bob's Opt is offered, never the card in Carol's graveyard.

### Mind Control: a stolen creature goes home when its thief leaves
- **Do:** Carol controls Bob's Hill Giant with Mind Control. Lightning Bolt Carol (she's at 3 life), then cast your second Bolt at Hill Giant.
- **Expect:** Hill Giant is back under Bob's control and can be targeted normally.

## The Tarkir precons, first half: costs, cycling, graveyard statics, edicts (2026-10-03, third round)

### Dismantling Wave: each target slot belongs to one opponent
- **Do:** Cast Dismantling Wave and work through each target slot.
- **Expect:** The prompts read 'choose artifact or enchantment the next opponent controls', then '...the opponent 2 seats on controls', then '...the opponent 3 seats on controls'. Bob's slot offers only his Sol Ring and Mind Stone, and Carol's only her Ghostly Prison. Dave has nothing to offer, so you can skip his slot without the cast getting stuck.
- **Not a bug:** The prompts name each opponent by seat ('the next opponent'), not by name — but report it if it's hard to tell who is meant.

### Dismantling Wave: two picks from one opponent are refused
- **Do:** Cast Dismantling Wave and try to pick both of Bob's artifacts.
- **Expect:** The second pick from Bob is refused.

### Dismantling Wave: the chosen targets are destroyed together
- **Do:** Cast Dismantling Wave: pick Bob's Sol Ring and Carol's Ghostly Prison, skip Dave.
- **Expect:** Both are destroyed at the same time. Your own Sol Ring survives.

### Windgrace's Judgment: lands are never offered
- **Do:** Cast Windgrace's Judgment aiming at Bob's Grizzly Bears and Carol's Serra Angel, and try to pick Carol's Island.
- **Expect:** The Island can't be chosen. The Bears and the Angel are destroyed at the same time.

### Afterlife from the Loam: one slot per graveyard, creature cards only
- **Do:** Cast Afterlife from the Loam (delve the Opts and Shocks if you like) and look at the target slots.
- **Expect:** Four slots: your graveyard first, then each opponent's in seat order. Each offers only creature cards.

### Afterlife from the Loam: two cards from one graveyard are refused
- **Do:** Cast Afterlife from the Loam and try to take both of Bob's cards.
- **Expect:** The second card from Bob's graveyard is refused.

### Afterlife from the Loam: the cards come back together as Zombies
- **Do:** Cast Afterlife from the Loam, picking your Grizzly Bears, Bob's Craw Wurm and Carol's Giant Spider.
- **Expect:** All three enter the battlefield together under your control, each showing the Zombie type next to its others.

### The Balrog of Moria: exiling it exiles a creature per opponent
- **Do:** Murder your own Balrog. Say yes to 'Exile The Balrog of Moria?', then pick one creature for each opponent.
- **Expect:** The Balrog goes from your graveyard to exile. A 'when you do' trigger then asks for one creature per opponent and exiles them together.

### The Balrog of Moria: saying no exiles nothing
- **Do:** Murder your own Balrog and say no to 'Exile The Balrog of Moria?'.
- **Expect:** The Balrog stays in your graveyard and nothing is exiled.

### Dismantling Wave: seats keep their numbers after a player leaves
- **Do:** Switch to Bob and concede. Back as Alice, cast Dismantling Wave.
- **Expect:** Carol's slot still reads 'the opponent 2 seats on', and Bob's slot has nothing to offer.

### Fractured Sanity: the cycle trigger resolves before the draw
- **Do:** Cycle Fractured Sanity with the Cycle button, then pass priority one step at a time.
- **Expect:** The card goes to your graveyard and the cost is paid as soon as you cycle. The stack shows a cycling ability from that card with its 'when you cycle this card' trigger above it. The trigger resolves first: Bob mills 4, and only then do you draw.

### Magmakin Artillerist: cycling one beside another deals 2
- **Do:** Cycle the Magmakin Artillerist in your hand (another one is on your battlefield).
- **Expect:** Bob takes 2 damage in total: 1 from the cycled card and 1 from the one on the battlefield. Both happen before you draw.

### Agonasaur Rex: cycled, it boosts a target
- **Do:** Cycle Agonasaur Rex and target your Grizzly Bears.
- **Expect:** The Bears get two +1/+1 counters, trample and indestructible.

### Agonasaur Rex: the cycle target can be skipped
- **Do:** Cycle Agonasaur Rex and skip the target.
- **Expect:** The target prompt (creature or Vehicle) can be skipped, and you still draw.

### Titanoth Rex: a trample counter on your only creature
- **Do:** Cycle Titanoth Rex.
- **Expect:** A trample counter goes on your Grizzly Bears, chosen automatically since it's your only creature.

### Vizier of Tumbling Sands: cycling untaps a land
- **Do:** Cycle Vizier of Tumbling Sands and target your tapped Island.
- **Expect:** The Island untaps.

### Vizier of Tumbling Sands: its tap ability can't target itself
- **Do:** Activate the Vizier on your battlefield ({T}: untap another target permanent).
- **Expect:** The Vizier itself can't be chosen; your tapped Island can.

### Decree of Pain: cycled, every creature gets -2/-2
- **Do:** Cycle Decree of Pain.
- **Expect:** Every creature, yours and Bob's, gets -2/-2 until end of turn.

### Migratory Route: the landcycling search waits on the stack
- **Do:** Basic-landcycle Migratory Route, then cast Think Twice in response.
- **Expect:** Think Twice resolves first. Only then does the search prompt appear.

### Fractured Sanity: no cycling under split second
- **Do:** Switch to Bob and cast Angel's Grace. Back as Alice, look for Fractured Sanity's Cycle button while it's on the stack.
- **Expect:** No Cycle button is shown and a cycle attempt is refused. The button comes back once Angel's Grace resolves.

### Agonasaur Rex: cycling on Grand Abolisher's turn
- **Do:** It's Bob's turn and he controls Grand Abolisher. When you get priority, cycle Agonasaur Rex.
- **Expect:** You can cycle it: a card in your hand isn't stopped by Grand Abolisher.

### The Balrog of Moria: cycled, it makes two Treasures
- **Do:** Cycle The Balrog of Moria.
- **Expect:** You get two Treasure tokens.

### Dismantling Wave: cycled, it destroys every artifact and enchantment
- **Do:** Cycle Dismantling Wave ({6}{W}{W}).
- **Expect:** Every artifact and enchantment is destroyed, yours too, before you draw.

### Hellkite Courser: offers only your own commander
- **Do:** Cast Hellkite Courser and look at its enters prompt.
- **Expect:** It lists only your commander in the command zone, never Bob's, and can be declined.
- **Not a bug:** The popup title is the general 'Choose a card to put onto the battlefield' and doesn't mention the command zone or that it's optional.

### Hellkite Courser: you can leave your commander where it is
- **Do:** Cast Hellkite Courser and decline its prompt.
- **Expect:** Krenko stays in the command zone.

### Hellkite Courser: the commander arrives with haste
- **Do:** Cast Hellkite Courser, choose Krenko, then attack with Krenko.
- **Expect:** Krenko enters with haste and can attack straight away.

### Hellkite Courser: the commander goes back at the end step
- **Do:** Cast Hellkite Courser, choose Krenko, and pass to your end step.
- **Expect:** At the beginning of the end step Krenko goes back to the command zone with no 'command zone instead?' prompt. Its commander tax hasn't gone up, since it was put onto the battlefield, not cast.

### Hellkite Courser: a commander that dies first
- **Do:** Cast Hellkite Courser, choose Krenko, Lightning Bolt Krenko, then pass to your end step.
- **Expect:** The usual 'command zone instead?' prompt appears when Krenko dies. The end-step trigger then does nothing.

### Hellkite Courser: a blinked commander stays
- **Do:** Cast Hellkite Courser, choose Krenko, Cloudshift Krenko, then pass to your end step.
- **Expect:** Krenko is a new object: it stays on the battlefield and has lost its haste.

### Hellkite Courser: the commander returns even if Courser dies
- **Do:** Cast Hellkite Courser, choose Krenko, Murder the Courser, then pass to your end step.
- **Expect:** Krenko still goes back to the command zone.

### Command Beacon: commander to hand, cast without tax
- **Do:** Cast Krenko from the command zone, Lightning Bolt it and put it back in the command zone. Activate Command Beacon ({T}, sacrifice it), then cast Krenko from your hand.
- **Expect:** Krenko goes to your hand. Cast from there it costs only {2}{R}{R}, with no commander tax.

### Command Beacon: a cast from hand adds no tax
- **Do:** Activate Command Beacon and cast Krenko from your hand. Lightning Bolt it and put it in the command zone, then look at its cost there.
- **Expect:** Casting it from the command zone still costs only {2}{R}{R}: the cast from hand added no tax.

### Command Beacon: no commander in the command zone
- **Do:** Activate Command Beacon's sacrifice ability while Krenko is on the battlefield.
- **Expect:** The Beacon is sacrificed and nothing else happens.

### Will of the Abzan: both modes while you control a commander
- **Do:** Cast Will of the Abzan (your commander Krenko is on the battlefield).
- **Expect:** You may choose both modes.

### Will of the Abzan: one mode without a commander
- **Do:** Cast Will of the Abzan (your commander is in the command zone).
- **Expect:** You may choose only one mode.

### Will of the Abzan: one opponent can't fill two slots
- **Do:** Cast Will of the Abzan, choose the sacrifice mode, and try to target Bob in two slots.
- **Expect:** The second slot refuses Bob.

### Will of the Abzan: opponents choose in turn order
- **Do:** Cast Will of the Abzan with the sacrifice mode, targeting Carol first, then Bob. Follow the action moves you to each as it's asked.
- **Expect:** Bob is asked first, then Carol, whatever order you targeted them. Bob is offered only his Craw Wurm; Carol chooses between her two tied Craw Wurms while Bob's is still on the battlefield. Both Wurms then leave together.

### Will of the Abzan: both modes resolve
- **Do:** Cast Will of the Abzan with both modes: target Carol and Bob (not Dave), and your Serra Angel in the graveyard.
- **Expect:** Bob and Carol each sacrifice a Craw Wurm and lose 3 life; Dave is untouched. Serra Angel returns under your control.

### Priest of Forgotten Gods: targeted players lose 2 and sacrifice
- **Do:** Activate Priest of Forgotten Gods, sacrificing your two Grizzly Bears, and target Bob and Carol.
- **Expect:** You choose the two sacrifices as you activate. Bob and Carol each lose 2 life, then each sacrifices a creature of their choice, at the same time. You add {B}{B} and draw a card.

### Priest of Forgotten Gods: mana and a card with no targets
- **Do:** Activate Priest of Forgotten Gods, sacrificing your two Grizzly Bears, and target no players.
- **Expect:** You still add {B}{B} and draw a card.

### Crackling Doom: each opponent sacrifices their biggest creature
- **Do:** Cast Crackling Doom. Switch to Bob when he's asked.
- **Expect:** Bob takes 2 damage. He chooses between his two Craw Wurms (the Bears isn't offered). Your Grizzly Bears is safe.

### Soul Shatter: the greatest mana value goes, planeswalker or not
- **Do:** Cast Soul Shatter.
- **Expect:** Bob must sacrifice Ajani, Caller of the Pride (mana value 3), not his Grizzly Bears (mana value 2).

### Will of the Mardu: the damage counts the new Warriors
- **Do:** Cast Will of the Mardu with both modes: Warriors for Bob as the target player, damage to Bob's Hill Giant.
- **Expect:** You get two Warriors (Bob controls two creatures). Then Hill Giant takes 3 damage — Krenko plus the two new Warriors — and dies. The modes resolve in printed order.

### Temple of the Dragon Queen: revealing a Dragon
- **Do:** Play the Temple, pick blue, then reveal Shivan Dragon.
- **Expect:** The colour is asked first, offering exactly the five colours. 'You may reveal a Dragon card' then offers only Shivan Dragon (never the Temple itself) and a way to decline; both questions come before the land enters. It enters untapped, and the revealed card is shown to the opponent and in the log.

### Temple of the Dragon Queen: untapped while you control a Dragon
- **Do:** Play the Temple and pick a colour (Shivan Dragon is on your battlefield, none in hand).
- **Expect:** The Temple enters untapped.

### Temple of the Dragon Queen: tapped when you don't reveal
- **Do:** Play the Temple, pick a colour, and decline to reveal Shivan Dragon.
- **Expect:** The Temple enters tapped.

### Temple of the Dragon Queen: taps for the chosen colour
- **Do:** Play the Temple, pick blue, then tap it for mana.
- **Expect:** It adds one blue mana.

### Quirion Ranger: one Forest returns without asking
- **Do:** Activate Quirion Ranger targeting your tapped Grizzly Bears.
- **Expect:** Your only Forest returns to your hand at once, without a prompt; the Mountain is never offered. The Bears untap.

### Quirion Ranger: only once each turn
- **Do:** Activate Quirion Ranger, play the Forest again, and try to activate it again.
- **Expect:** The second activation is refused ('Activate only once each turn').

### Quirion Ranger: choosing between two Forests
- **Do:** Activate Quirion Ranger targeting your tapped Grizzly Bears.
- **Expect:** The ability goes on the stack and a 'Choose one to return to its owner's hand' prompt lists only your two Forests.
- **Not a bug:** You pick the Forest after the ability is already on the stack.

### Quirion Ranger: priority goes back to whoever used it
- **Do:** On your turn, when Bob has priority, switch to Bob and activate his Quirion Ranger, choosing one of his two Forests.
- **Expect:** After he chooses, priority goes back to Bob, even though it's your turn.

### Mina and Denn, Wildborn: returning the land that paid
- **Do:** Activate Mina and Denn, paying {R}{G} with both lands and targeting your Grizzly Bears. Return the Mountain you just tapped.
- **Expect:** The tapped Mountain can be returned. The Bears gain trample until end of turn.

### Mina and Denn, Wildborn: two land plays
- **Do:** Play the Forest, then the Mountain, from your hand.
- **Expect:** Both are allowed this turn.

### Multani, Yavimaya's Avatar: its size counts your lands and graveyard
- **Do:** Look at Multani's power and toughness.
- **Expect:** It's 3/3: your two lands plus the Mountain in your graveyard. Bob's Forest in his graveyard doesn't count.

### Multani, Yavimaya's Avatar: not offered with one land
- **Do:** Look for Multani's ability in your graveyard (you control one land).
- **Expect:** It isn't offered.

### Multani, Yavimaya's Avatar: two lands pay and go back
- **Do:** Activate Multani's graveyard ability, tapping both your lands for {1}{G}, and return those same two lands.
- **Expect:** Both lands go back to your hand and Multani goes to your hand.

### Multani, Yavimaya's Avatar: with three lands, you choose which two
- **Do:** Activate Multani's graveyard ability and choose two of your three lands to return.
- **Expect:** The two lands you chose go back to your hand, and Multani goes to your hand.

### Myr Battlesphere: four Myr on entering
- **Do:** Cast Myr Battlesphere.
- **Expect:** You get four 1/1 colourless Myr artifact creature tokens.

### Myr Battlesphere: the tap prompt includes summoning-sick Myr
- **Do:** Attack Bob with Battlesphere alone and look at 'Tap any number of untapped Myr you control'.
- **Expect:** It offers only your untapped Myr, including the summoning-sick ones, but not the tapped one. Choosing zero is allowed.

### Myr Battlesphere: tapping three Myr
- **Do:** Attack Bob with Battlesphere alone and tap three Myr.
- **Expect:** Exactly those three tap. Battlesphere is 7/7 until end of turn and deals 3 damage to Bob right away, before combat damage.

### Myr Battlesphere: attacking a planeswalker
- **Do:** Attack Bob's Ajani with Battlesphere alone and tap three Myr.
- **Expect:** Ajani loses 3 loyalty right away, before combat damage.

### Myr Battlesphere: tapping no Myr
- **Do:** Attack Bob with Battlesphere alone and tap no Myr.
- **Expect:** No bonus and no extra damage.

### Gravecrawler: an opponent's Zombie doesn't count
- **Do:** Look for a way to cast Gravecrawler from your graveyard (only Bob controls a Zombie).
- **Expect:** It can't be cast from there.

### Essence Anchor: not offered before a card leaves your graveyard
- **Do:** Look at Essence Anchor's abilities.
- **Expect:** Its token ability isn't offered.

### Lord of the Forsaken: its mana can't pay for a spell from your hand
- **Do:** Activate Lord's 'Pay 1 life: Add {C}' by hand, then try to spend it on Sol Ring from your hand.
- **Expect:** Each activation costs 1 life. The {C} can't pay for Sol Ring.
- **Not a bug:** The auto-payer never uses Lord's mana; you activate it by hand.

### Lord of the Forsaken: its mana pays for flashback
- **Do:** Activate Lord's mana ability five times, then flash back Welcome the Dead ({5}{B}) with that {C} and your Swamp.
- **Expect:** The {C} pays the flashback's generic cost and the spell is cast.

### Teval's Judgment: a card leaving your graveyard offers all three modes
- **Do:** Flash back Welcome the Dead.
- **Expect:** Teval's Judgment triggers, offering all three modes, and resolves before Welcome the Dead.

### Welcome the Dead: X counts cards put into your graveyard this turn
- **Do:** Cycle Fractured Sanity. Then flash back Welcome the Dead: draw 2, discard 1.
- **Expect:** You lose 2 life and get two tapped 2/2 Zombie Druids: the cycled Fractured Sanity plus the discard. Welcome the Dead doesn't count itself, and is exiled afterwards.

### Gravecrawler: castable from your graveyard with your own Zombie
- **Do:** In your main phase, cast Gravecrawler from your graveyard (you control a Zombie token).
- **Expect:** It can be cast from your graveyard.

### Teval's Judgment: the second trigger offers only unused modes
- **Do:** Cast one Gravecrawler from your graveyard and pick a Teval's mode. Then cast the other.
- **Expect:** The second Teval's trigger offers only the two modes not yet chosen.

### Teval's Judgment: no fourth trigger in a turn
- **Do:** Cast all four Gravecrawlers from your graveyard one at a time, picking a Teval's mode each time.
- **Expect:** The first three each ask for a mode. The fourth gives no prompt at all: every mode has been used.

### Essence Anchor: a Zombie Druid after a card leaves
- **Do:** Cast Gravecrawler from your graveyard, then activate Essence Anchor.
- **Expect:** You get a 2/2 Zombie Druid token.

### Essence Anchor: not on an opponent's turn
- **Do:** It's Bob's turn. When you get priority, flash back Think Twice, then look at Essence Anchor's abilities.
- **Expect:** Its token ability isn't offered.

### Anger: haste from the graveyard
- **Do:** Look at your creatures, then attack with the summoning-sick Grizzly Bears.
- **Expect:** Your creatures have haste (you control a Mountain), so the new Bears can attack. Bob's Bears doesn't get haste.

### Brawn: trample from the graveyard
- **Do:** Look at your Grizzly Bears.
- **Expect:** It has trample (you control a Forest).

### Filth: swampwalk from the graveyard
- **Do:** Attack Bob with your Grizzly Bears.
- **Expect:** Your Bears has swampwalk, so Bob (who controls a Swamp) can't block it.

### Wonder: flying needs an Island
- **Do:** Look at your Grizzly Bears, then play the Island and look again.
- **Expect:** No flying before the Island; flying after.

### Wonder: on the battlefield it grants nothing
- **Do:** Look at Wonder and your Grizzly Bears.
- **Expect:** Wonder itself has flying, but the Bears don't.

### Wonder: dying after Turn to Frog still grants flying
- **Do:** Cast Turn to Frog on your Grizzly Bears, then Doom Blade Wonder.
- **Expect:** The Frog'd Bears has flying: Wonder's effect started when it reached the graveyard, after Turn to Frog.

### Wonder: Turn to Frog after Wonder dies wins
- **Do:** Doom Blade Wonder, then cast Turn to Frog on your Grizzly Bears.
- **Expect:** The Frog'd Bears has no flying: Turn to Frog is newer.

### Legion Warboss: a hasty Goblin at the beginning of combat
- **Do:** Go to combat.
- **Expect:** At the beginning of combat Warboss makes a 1/1 red Goblin token with haste.

### Legion Warboss: the Goblin must attack
- **Do:** Go to combat and try to declare attackers without the Goblin token.
- **Expect:** It's refused: the Goblin must attack this combat.

### Legion Warboss: mentor can target only the Goblin
- **Do:** Attack with Warboss, its Goblin and Ainok Strike Leader, and point mentor at a target.
- **Expect:** The Goblin (power 1) can be targeted; Ainok (power 2) can't.

### Ainok Strike Leader: a Goblin attacking each opponent
- **Do:** Attack Bob with Ainok Strike Leader.
- **Expect:** You get one tapped Goblin per opponent, one attacking Bob and one attacking Carol, even though you didn't attack Carol.

### Within Range: Ainok's Goblins first
- **Do:** Attack Bob with Warboss, its Goblin and Ainok. Order the triggers so Ainok's resolves before Within Range's.
- **Expect:** Bob loses 4 life and Carol loses 1.

### Within Range: before Ainok's Goblins
- **Do:** Attack Bob with Warboss, its Goblin and Ainok. Order the triggers so Within Range's resolves first.
- **Expect:** Bob loses 3 life and Carol loses none.

### Ainok Strike Leader: your commander attacking alone
- **Do:** Attack with only your commander, Krenko.
- **Expect:** Ainok triggers and makes its Goblins.

### Ainok Strike Leader: no trigger for another creature alone
- **Do:** Attack with only your Grizzly Bears.
- **Expect:** Ainok doesn't trigger.

### Legion Warboss: the Goblin keeps haste after combat
- **Do:** Go to combat and attack with the Goblin token, then look at it in your second main phase.
- **Expect:** It still has haste.

### Legion Warboss: Ghostly Prison under one opponent
- **Do:** Go to combat and try to leave the Goblin token home (Bob has Ghostly Prison).
- **Expect:** You can't: the Goblin must still attack Carol, who has no Prison.

### Legion Warboss: Ghostly Prison under every opponent
- **Do:** Go to combat and leave the Goblin token home (Bob and Carol both have Ghostly Prison).
- **Expect:** It may stay home.

### Divine Visitation: Treasures stay Treasures
- **Do:** Cycle The Balrog of Moria.
- **Expect:** You get two Treasures, not Angels.

### Divine Visitation: Warboss's token is an Angel that must attack
- **Do:** Go to combat.
- **Expect:** Warboss's token is a 4/4 white flying, vigilant Angel. It still has haste and still must attack this combat.

### Divine Visitation: Ainok's tokens are Angels
- **Do:** Attack Bob with Ainok Strike Leader.
- **Expect:** Ainok's tokens are Angels, each tapped and attacking its own opponent.

### Redoubled Stormsinger: copies every token that entered this turn
- **Do:** Attack Bob with Warboss's token, Ainok and Stormsinger. Order the triggers so Ainok's resolves before Stormsinger's, and send some copies at Carol when asked.
- **Expect:** Three copies, one per token that entered this turn, never the older Goblin. Each copy is an Angel and enters tapped and attacking whichever player you picked for it.

### Redoubled Stormsinger: before Ainok's trigger
- **Do:** Attack Bob with Warboss's token, Ainok and Stormsinger. Order the triggers so Stormsinger's resolves first.
- **Expect:** Only one copy (of Warboss's token).

### Redoubled Stormsinger: copies are sacrificed at the end step
- **Do:** Attack with Warboss's token and Stormsinger, then go to your end step.
- **Expect:** At the beginning of the end step the copy is sacrificed; the original token stays.

### Legion Warboss: tokens from different turns stack apart
- **Do:** Go to combat and look at your Goblin tokens.
- **Expect:** The new Goblin shows in a separate stack from the older one.

### Divine Visitation: an opponent's Goblin stays a Goblin
- **Do:** Watch the beginning of combat on Bob's turn.
- **Expect:** Bob's Warboss makes a normal 1/1 red Goblin.

### Sarkhan, Soul Aflame: Dragon spells cost 1 less
- **Do:** Cast Shivan Dragon with your five Mountains.
- **Expect:** It costs {3}{R}{R}: only the generic part is reduced.

### Sarkhan, Soul Aflame: becoming a copy of Shivan Dragon
- **Do:** Cast Shivan Dragon and say yes to 'Have Sarkhan become a copy of that Dragon until end of turn?'. Use the copy's firebreathing.
- **Expect:** Sarkhan is a 6/6 flying Dragon (Shivan's 5/5 plus his counter) with working firebreathing. He's still named Sarkhan, Soul Aflame, is legendary, and stays untapped.

### Sarkhan, Soul Aflame: as a copy, he loses his own abilities
- **Do:** Cast Shivan Dragon and have Sarkhan copy it. Then cast Glorybringer.
- **Expect:** Glorybringer costs its full price. It enters with no copy prompt.

### Sarkhan, Soul Aflame: back to normal in the cleanup step
- **Do:** Cast Shivan Dragon, have Sarkhan copy it, and end the turn.
- **Expect:** In the cleanup step he's a 3/5 Human Shaman again.

### Sarkhan, Soul Aflame: copying Lathliss, no legend rule
- **Do:** Cast Lathliss, Dragon Queen and have Sarkhan copy it.
- **Expect:** Both stay on the battlefield: their names differ.

### Sarkhan, Soul Aflame: copying a Dragon that's already gone
- **Do:** Cast Shivan Dragon. With the copy trigger on the stack, Murder the Dragon, then say yes.
- **Expect:** Sarkhan copies Shivan Dragon as it last existed.

### Sarkhan, Soul Aflame: an opponent's Dragon doesn't trigger him
- **Do:** Switch to Bob and cast his Shivan Dragon.
- **Expect:** You get no copy prompt.

### Decree of Pain: destroys every creature but the indestructible
- **Do:** Cast Decree of Pain.
- **Expect:** Every creature is destroyed except Bob's indestructible Darksteel Myr. You draw a card for each creature destroyed (not the Myr).

### Colfenor's Urn: asks about each of your big creatures
- **Do:** Giant Growth your Grizzly Bears (now 5/5), then cast Decree of Pain.
- **Expect:** 'Exile it with Colfenor's Urn?' is asked for your Serra Angel, Craw Wurm, Giant Spider and the pumped Bears. It isn't asked for Bob's Serra Angel.

### Colfenor's Urn: declining leaves the card in the graveyard
- **Do:** Murder your Serra Angel and say no to 'Exile it with Colfenor's Urn?'.
- **Expect:** The Angel stays in your graveyard.

### Colfenor's Urn: three cards return at the end step
- **Do:** Cast Decree of Pain, say yes for all three creatures, then go to your end step.
- **Expect:** At the beginning of the end step the Urn is sacrificed and all three return to the battlefield as new, summoning-sick creatures.

### Colfenor's Urn: the third card on the opponent's turn
- **Do:** Murder your Serra Angel and Craw Wurm, exiling both with the Urn, and pass your end step. On Bob's turn, Murder your Giant Spider and exile it too.
- **Expect:** Nothing happens at your end step. At Bob's end step the Urn is sacrificed and all three return.

### Colfenor's Urn: a token exiles nothing
- **Do:** Murder your 4/4 Angel token.
- **Expect:** The Urn can trigger, but nothing is exiled.

### Wall of Roots: once each turn, even tapped
- **Do:** Activate Wall of Roots by hand (it's tapped and summoning sick), then try again.
- **Expect:** It adds {G} and gets a -0/-1 counter (0/4). The second try is refused.

### Wall of Roots: again on the next player's turn
- **Do:** Activate Wall of Roots on your turn. On Bob's turn, when you get priority, activate it again.
- **Expect:** It works again and becomes 0/3.

### Wall of Roots: used when the lands can't pay
- **Do:** Cast Grizzly Bears with your one Forest and the Wall.
- **Expect:** The auto-payer uses the Wall for the missing mana.

### Wall of Roots: not used when the lands can pay
- **Do:** Cast Grizzly Bears (you have two Forests).
- **Expect:** The auto-payer taps the Forests and leaves the Wall alone.

### Devoted Druid: the second untap kills it first
- **Do:** Tap Devoted Druid for {G}, untap it with a -1/-1 counter, and repeat.
- **Expect:** The untap goes on the stack. The second counter makes it -2/0, so it dies before the untap resolves.

### Tree of Redemption: swapping your life and its toughness
- **Do:** Activate Tree of Redemption (you're at 7 life; it's 2/15 with two +1/+1 counters).
- **Expect:** You go to 15 life and the Tree becomes 2/9 (toughness set to 7, counters on top). The change is permanent, not until end of turn.

### Tree of Perdition: swapping an opponent's life and its toughness
- **Do:** Activate Tree of Perdition targeting Bob (at 31 life).
- **Expect:** Only an opponent can be targeted. Bob goes to 13 and the Tree becomes 0/31.

### Tree of Redemption: The Lord of Pain stops the swap
- **Do:** Activate Tree of Redemption at 5 life (Bob controls The Lord of Pain).
- **Expect:** Nothing happens at all: neither your life nor the Tree changes.

### Tree of Redemption: The Lord of Pain allows a loss
- **Do:** Activate Tree of Redemption at 30 life (Bob controls The Lord of Pain).
- **Expect:** The swap works: you go down to 13 and the Tree becomes 0/30.

### Weathered Sentinels: can't attack at first
- **Do:** Go to combat and look at Sentinels' attack options.
- **Expect:** It can't attack anyone (defender).

### Weathered Sentinels: only a player who attacked you
- **Do:** Switch to Bob and attack your Ajani with his Bears. Then switch to Carol and attack you. On your turn, look at Sentinels' attack options.
- **Expect:** Only Carol is offered. Bob attacked your planeswalker, not you, and planeswalkers are never offered.

### Weathered Sentinels: +3/+3 and indestructible when it attacks
- **Do:** Switch to Bob and attack you with his Bears. On your turn, attack Bob with Sentinels.
- **Expect:** Sentinels gets +3/+3 and indestructible until end of turn (5/8), and keeps defender, reach, vigilance and trample.

### Weathered Sentinels: only each player's last turn counts
- **Do:** Switch to Bob and attack you with his Bears. Pass your turn without attacking, let Bob take a turn without attacking you, then look at Sentinels' options on your next turn.
- **Expect:** Bob isn't offered any more.

## The Tarkir precons, second half: void counters, votes, X costs, "as long as" (2026-10-03, third round)

### Tasigur, the Golden Fang: you choose the opponent after the mill
- **Do:** Activate Tasigur's {2}{G/U}{G/U} ability.
- **Expect:** Nothing is targeted as you activate. As it resolves you mill two first, then pick one of your opponents from a list.
- **Not a bug:** The options read 'Choose Bob', the seat name, not the player's display name (already known).

### Tasigur, the Golden Fang: the opponent picks any nonland card
- **Do:** Activate Tasigur and choose Carol. Switch to Carol and pick a card.
- **Expect:** Carol's popup reads 'Choose a card to put into <your name>'s hand'. It offers Serra Angel (just milled), Hill Giant and Grizzly Bears, but no lands. The card she picks goes to your hand.

### Tasigur, the Golden Fang: no opponent question with one opponent
- **Do:** Activate Tasigur in this 2-player game.
- **Expect:** You aren't asked to choose an opponent.

### Colossal Grave-Reaver: one trigger, for the card still there
- **Do:** Activate Tasigur (you mill Serra Angel and Craw Wurm). Switch to Bob and give you Serra Angel. Let Grave-Reaver's trigger resolve.
- **Expect:** Grave-Reaver triggers once for the two creature cards. Craw Wurm, the only one still in your graveyard, is put onto the battlefield without a prompt.

### Selvala's Stampede: votes in turn order, no abstaining
- **Do:** Cast Selvala's Stampede. Vote as Alice, then as Bob and Carol (Follow the action moves you to each).
- **Expect:** Nobody votes until the spell resolves. You're asked first, then Bob, then Carol, each with two options, 'Vote for wild' and 'Vote for free', and no way to decline.

### Selvala's Stampede: later voters see the earlier votes
- **Do:** Cast Selvala's Stampede and vote 'wild'. Switch to Bob and look before voting, then at Carol's.
- **Expect:** Bob can tell how you voted, and Carol can tell both earlier votes.
- **Not a bug:** The log words a vote as 'Selvala's Stampede — Bob chose mode(s) 2' — but report it if that isn't enough to tell how someone voted.

### Selvala's Stampede: two wild votes and one free
- **Do:** Cast Selvala's Stampede. Vote: you 'wild', Bob 'free', Carol 'wild'. At the hand prompt, pick Serra Angel.
- **Expect:** You reveal Island, Grizzly Bears, Island, Hill Giant: Bears and Hill Giant enter together, the Islands are shuffled back, and Craw Wurm is never revealed. Then 'Choose up to 1 card to put onto the battlefield' offers only permanent cards from your hand (not Giant Growth). Serra Angel enters after the revealed creatures.

### Selvala's Stampede: three free votes
- **Do:** Cast Selvala's Stampede and have everyone vote 'free'.
- **Expect:** Nothing is revealed. You may put up to 3 permanent cards from your hand onto the battlefield.

### Gix, Yawgmoth Praetor: your creature hits an opponent
- **Do:** Attack Bob with your Grizzly Bears.
- **Expect:** After damage you're asked to 'Pay 1 life', with an option to decline. Paying puts you at 19 and draws a card.

### Gix, Yawgmoth Praetor: an opponent's creature hits another opponent
- **Do:** Switch to Bob and attack Carol with his Grizzly Bears.
- **Expect:** Bob, not you, is asked whether to pay 1 life and draw.

### Gix, Yawgmoth Praetor: nothing when a creature hits you
- **Do:** Switch to Bob and attack you with his Grizzly Bears. Don't block.
- **Expect:** Nobody is asked anything.

### Gix, Yawgmoth Praetor: an X for a cost with no X
- **Do:** Activate Gix's {4}{B}{B}{B}, Discard X ability targeting Bob. Choose X = 3.
- **Expect:** An X picker appears though the cost has no {X}, capped at the 4 cards in your hand. The discard prompt asks for exactly 3 cards.

### Gix, Yawgmoth Praetor: playing the exiled cards free
- **Do:** Activate Gix with X = 3 targeting Bob. Cast the Grizzly Bears free, play the Forest, then decline.
- **Expect:** You're offered the spells free and the Forest as a land play, again after each one, until you decline. The Hill Giant you declined stays in exile and can't be played later.

### Gix, Yawgmoth Praetor: no land off your turn
- **Do:** It's Bob's turn. When you get priority, activate Gix with X = 3 targeting Bob.
- **Expect:** The Forest isn't offered.

### Gix, Yawgmoth Praetor: a card discarded meanwhile isn't offered
- **Do:** Activate Gix with X = 2 targeting Bob. Cast Thrill of Possibility free, discarding a card from your hand to pay its cost.
- **Expect:** The discarded card goes to exile (Rest in Peace). The next offer lists only Hill Giant, not that card.

### Lethal Scheme: the order prompt names each convoker
- **Do:** Cast Lethal Scheme on Bob's Serra Angel, convoking with both Grizzly Bears for the {2} and Swamps for {B}{B}.
- **Expect:** The Angel is destroyed before anyone connives. You're then asked the order, each creature labelled 'Grizzly Bears (convoked 1st)' or '(convoked 2nd)'.

### Lethal Scheme: only a nonland discard gives a counter
- **Do:** Cast Lethal Scheme, convoking with both Bears. Discard Hill Giant on the first connive and the Island on the second.
- **Expect:** Each connive draws, then discards. Only the Bears that discarded Hill Giant gets a +1/+1 counter.

### Lethal Scheme: a convoker that died still connives
- **Do:** Cast Lethal Scheme, convoking with both Bears. In response, Murder the Bears you tapped first. Have it connive first and discard Hill Giant.
- **Expect:** It's labelled '(convoked 1st, gone)'. It still connives — you draw and discard — but no counter lands anywhere.

### Lethal Scheme: a copy connives with the same creatures
- **Do:** Cast Lethal Scheme, convoking with both Bears. Twincast it, aim the copy at Bob's other Angel, and discard nonland cards every time.
- **Expect:** Four connives in all, two from the copy and two from the original. Each Bears ends with two counters.

### Necropolis Fiend: X and the cards to exile
- **Do:** Activate Necropolis Fiend with X = 2, target Bob's Serra Angel, and exile the Bears and the Island when asked.
- **Expect:** The X picker tops out at 2. A popup 'Choose 2 cards to exile' lists your graveyard; the two are exiled together and priority comes back to you. The Angel is 2/2 until end of turn.
- **Not a bug:** You pick the cards after the ability is already on the stack.

### Necropolis Fiend: X is limited by your graveyard
- **Do:** Activate Necropolis Fiend and try X = 2 (one card in your graveyard).
- **Expect:** X = 2 isn't allowed.

### Moorland Haunt: not offered without a creature card
- **Do:** Look for Moorland Haunt's Spirit ability (only an Island in your graveyard).
- **Expect:** It isn't offered.

### Moorland Haunt: choosing between two creature cards
- **Do:** Activate Moorland Haunt's Spirit ability (two creature cards in your graveyard).
- **Expect:** You're asked which one to exile. You get a 1/1 flying Spirit.

### Shigeki, Jukai Visionary: returning itself to reveal four
- **Do:** Activate Shigeki's {1}{G}, {T}, Return Shigeki ability. Put the Swamp onto the battlefield.
- **Expect:** Shigeki goes to your hand as you activate, before anyone can respond. All four cards are revealed; the Swamp enters tapped and the other three go to your graveyard.

### Shigeki, Jukai Visionary: channel offered up to X = 2
- **Do:** Open Shigeki's channel options from your hand.
- **Expect:** It's offered once per X: X = 0, 1 and 2, no higher despite your mana (only two nonlegendary cards in your graveyard).

### Shigeki, Jukai Visionary: channel can't target a legendary card
- **Do:** Channel Shigeki at X = 2, trying first to include Baldin, Century Herdmaster.
- **Expect:** Baldin can't be targeted, and you need exactly 2 targets. Shigeki goes to your graveyard as the discard cost, and the two cards return to your hand together.

### Steward of the Harvest: targets only land cards in your graveyard
- **Do:** Cast Steward of the Harvest and look at its enters target prompt.
- **Expect:** Up to three targets, only land cards from your own graveyard.

### Steward of the Harvest: your creatures get the lands' abilities
- **Do:** Cast Steward, exiling the Forest and Evolving Wilds. Look at your creatures' abilities and Bob's.
- **Expect:** Every creature you control lists '{T}: Add {G}' and Evolving Wilds' sacrifice-and-search ability. Bob's creature doesn't.

### Steward of the Harvest: summoning-sick creatures can't tap
- **Do:** Cast Steward, exiling the Forest and Evolving Wilds. Try the {T} abilities on Steward and the new Grizzly Bears.
- **Expect:** Neither can use them: both are summoning sick.

### Steward of the Harvest: a creature taps for green
- **Do:** Cast Steward, exiling the Forest and Evolving Wilds. Tap your older Grizzly Bears for {G} and spend it on Giant Growth.
- **Expect:** The Bears adds {G}, and it pays for Giant Growth.

### Steward of the Harvest: Evolving Wilds sacrifices the creature
- **Do:** Cast Steward, exiling the Forest and Evolving Wilds. Activate the Evolving Wilds ability on your older Grizzly Bears.
- **Expect:** The Bears is sacrificed, not a land.

### Steward of the Harvest: the abilities go when it leaves
- **Do:** Cast Steward, exiling the Forest and Evolving Wilds. Murder the Steward and look at your Bears' abilities.
- **Expect:** The granted abilities are gone. The lands stay in exile.

### Sepulchral Primordial: one target slot per opponent
- **Do:** Cast Sepulchral Primordial. Try putting Carol's Grizzly Bears in Bob's slot, then pick Hill Giant for Bob and the Bears for Carol.
- **Expect:** One optional slot per opponent, worded by seat ('creature card in the next opponent's graveyard', 'the opponent 2 seats on's graveyard'). Each slot accepts only that player's cards. Report it if the wording is hard to follow.

### Sepulchral Primordial: putting only some targets onto the battlefield
- **Do:** Cast Sepulchral Primordial targeting Bob's Hill Giant and Carol's Grizzly Bears. On resolution, choose only the Bears.
- **Expect:** A popup 'Choose up to 3 cards to put onto the battlefield' offers only the targeted cards. The Bears enters under your control.

### Sepulchral Primordial: two artifacts enter together
- **Do:** Cast Sepulchral Primordial targeting both Ornithopters, and choose both on resolution.
- **Expect:** They enter together, so Ingenious Artillerist triggers once: 2 damage each to Bob and Carol.

### Diluvian Primordial: casting both spells in your order
- **Do:** Cast Diluvian Primordial targeting Bob's Lightning Bolt and Carol's Shock. On resolution, cast Shock first at Carol, then the Bolt.
- **Expect:** You pick which to cast first, free. After Shock only the Bolt is re-offered. The Bolt, cast last, resolves first, and each spell is exiled after resolving.

### Diluvian Primordial: a declined spell stays in the graveyard
- **Do:** Cast Diluvian Primordial targeting Bob's Lightning Bolt and Carol's Shock. Cast Shock, then decline the Bolt.
- **Expect:** The Bolt stays in Bob's graveyard.

### Combustible Gearhulk: the opponent lets you draw
- **Do:** Cast Combustible Gearhulk targeting Bob. Switch to Bob and pick 'Have them draw three cards.'
- **Expect:** Bob, not you, gets the two-option prompt. You draw 3 and Bob's life is unchanged.

### Combustible Gearhulk: the opponent chooses the mill
- **Do:** Cast Combustible Gearhulk targeting Bob. Switch to Bob and pick the mill option.
- **Expect:** You mill Fireball, Grizzly Bears and Hill Giant. Bob takes 7 damage from the Gearhulk: 4 + 2 + 1, Fireball's {X} counting as 0.

### Combustible Gearhulk: draw three from a two-card library
- **Do:** Cast Combustible Gearhulk targeting Bob. Switch to Bob and pick the draw.
- **Expect:** The draw is still offered. You lose for drawing from an empty library.

### Dauthi Voidwalker: only shadow creatures can block it
- **Do:** Attack Bob with Dauthi. Switch to Bob and try to block with his Grizzly Bears.
- **Expect:** The Bears can't block. Dauthi's card shows the shadow symbol.

### Dauthi Voidwalker: it can block only shadow creatures
- **Do:** Switch to Bob and attack you with his Grizzly Bears. Back as Alice, try to block with Dauthi.
- **Expect:** Dauthi can't block the Bears.

### Dauthi Voidwalker: an opponent's creature gets a void counter
- **Do:** Murder Bob's Grizzly Bears.
- **Expect:** It goes to exile with a visible void counter instead of Bob's graveyard.

### Dauthi Voidwalker: your own creature still goes to your graveyard
- **Do:** Murder your own Grizzly Bears.
- **Expect:** It goes to your graveyard as usual.

### Dauthi Voidwalker: an opponent's token still dies
- **Do:** Murder Bob's Goblin token.
- **Expect:** The token dies as usual, with no void counter.

### Dauthi Voidwalker: a flashback spell gets no void counter
- **Do:** Switch to Bob and flash back Think Twice.
- **Expect:** It's exiled by flashback, with no void counter.
- **Not a bug:** Bob isn't asked which exile applies: the game picks for him.

### Dauthi Voidwalker: an opponent's sorcery gets a void counter
- **Do:** Switch to Bob and cast Lava Spike at you.
- **Expect:** After it resolves, Lava Spike is exiled with a void counter.

### Dauthi Voidwalker: Rest in Peace's exile wins
- **Do:** Murder Bob's Grizzly Bears (Bob controls Rest in Peace).
- **Expect:** The Bears is exiled without a void counter.
- **Not a bug:** Bob isn't asked which exile applies: the game picks for him.

### Dauthi Voidwalker: playing the only void card
- **Do:** Murder Bob's Grizzly Bears, then tap and sacrifice Dauthi.
- **Expect:** The Bears is chosen automatically. You may cast it this turn without paying its mana cost.

### Dauthi Voidwalker: choosing among void cards
- **Do:** Murder Bob's Grizzly Bears and Serra Angel, then tap and sacrifice Dauthi.
- **Expect:** A popup 'Choose a card you may play' lists the Bears and the Angel. Bob's Hill Giant, exiled without a void counter, isn't offered.

### Territorial Hellkite: a random opponent it must attack
- **Do:** Go to combat. At declare attackers, try sending the Hellkite at the other opponent.
- **Expect:** The log reads '<player> is chosen at random: Territorial Hellkite attacks them this combat if able'. The attack bar starts with the Hellkite on that player and refuses another defender.

### Scourge of the Throne: attacking the most life adds a combat
- **Do:** Attack Bob (40 life, the most) with Scourge of the Throne.
- **Expect:** Scourge gets a dethrone +1/+1 counter. Its other trigger untaps all attacking creatures and adds a combat after this one.

### Territorial Hellkite: the other opponent in the extra combat
- **Do:** Attack with the Hellkite where it must go and Scourge at Bob. Let Scourge's trigger resolve, then go to the additional combat.
- **Expect:** The Hellkite triggers again and must attack the other opponent, the one it didn't attack in the first combat.

### Scourge of the Throne: no third combat
- **Do:** Attack Bob with Scourge. In the additional combat, attack Bob with it again.
- **Expect:** It gets another dethrone counter, but no third combat: it's not its first attack this turn.

### Scourge of the Throne: no extra combat if Bob isn't highest any more
- **Do:** Attack Bob (40 life) with Scourge. While its triggers are on the stack, cast Revitalize (you go from 38 to 41).
- **Expect:** The dethrone counter still lands, but the untap and the extra combat don't happen.

### Territorial Hellkite: taps itself with no one to choose
- **Do:** Go to combat on three of your turns in a row, attacking with the Hellkite whenever it can.
- **Expect:** Turn 1: Bob is chosen. Turn 2: nobody can be chosen and the Hellkite taps itself. Turn 3: Bob is chosen again.

### Territorial Hellkite: an attack tax frees it
- **Do:** Go to combat. If the log says Bob was chosen (he has Propaganda), try to attack Carol with the Hellkite instead. If Carol was chosen, reload and try again.
- **Expect:** The Hellkite may attack Carol instead, or stay home.

### Opportunistic Dragon: the stolen Human stays stolen
- **Do:** Cast Opportunistic Dragon targeting Syr Konrad, then pass to your next turn.
- **Expect:** You control Konrad, with no abilities, and it can't attack or block. The log doesn't say 'this turn', and you still control it on your next turn.

### Opportunistic Dragon: Konrad goes back when the Dragon dies
- **Do:** Cast the Dragon targeting Syr Konrad, then Murder the Dragon.
- **Expect:** Konrad goes back to Bob with his abilities. He doesn't deal damage for the Dragon's death.

### Opportunistic Dragon: Konrad pings for the next death
- **Do:** Cast the Dragon targeting Syr Konrad. Murder the Dragon, then Murder your Grizzly Bears.
- **Expect:** When the Bears dies, Bob's Konrad deals 1 damage to you.

### Opportunistic Dragon: a blink ends the old steal at once
- **Do:** Cast the Dragon targeting Syr Konrad. Cloudshift the Dragon and target Sol Ring with the new trigger.
- **Expect:** Konrad goes back to Bob, with his abilities, as soon as the Dragon blinks. You take Sol Ring.

### Opportunistic Dragon: you keep Konrad when the Dragon is stolen
- **Do:** Cast the Dragon targeting Syr Konrad and pass the turn. Switch to Bob and cast Act of Treason on the Dragon.
- **Expect:** You keep Konrad, still without abilities, while Bob controls the Dragon.

### Opportunistic Dragon: killed before its trigger resolves
- **Do:** Cast the Dragon targeting Syr Konrad. With the trigger on the stack, Murder the Dragon.
- **Expect:** Nothing happens: Konrad never changes hands.

### Chandra's Ignition: deathtouch and lifelink damage
- **Do:** Cast Chandra's Ignition targeting your Vampire Nighthawk.
- **Expect:** Your Bears and both of Bob's creatures die (deathtouch), Bob goes to 18, and the Nighthawk takes no damage. You gain 8 life in one gain: a single log line.

### Chandra's Ignition: nothing if the creature is gone
- **Do:** Cast Chandra's Ignition targeting your Vampire Nighthawk, then Murder the Nighthawk in response.
- **Expect:** Nothing happens at all.

### Arachnogenesis: counts only creatures attacking you
- **Do:** Switch to Bob and attack you with his Bears and Hill Giant, and Carol with his Craw Wurm. Back as Alice, cast Arachnogenesis.
- **Expect:** You get two 1/2 Spiders with reach. The Wurm attacking Carol doesn't count.

### Arachnogenesis: Spiders still deal combat damage
- **Do:** Switch to Bob and attack you with his Bears and Hill Giant. Back as Alice, cast Arachnogenesis and block the Bears with a Spider.
- **Expect:** You take no combat damage. The Spider deals its 1 damage to the Bears while the Bears' damage to it is prevented. The log says 'Arachnogenesis: some combat damage is prevented this turn'.

### Baloth Prime: enters tapped with six stun counters
- **Do:** Cast Baloth Prime.
- **Expect:** It enters tapped with 6 stun counters shown on the card.

### Baloth Prime: stun counters keep it tapped
- **Do:** Pass to your next turn (Baloth has one stun counter), then to the turn after.
- **Expect:** The first untap step removes the counter instead of untapping it. The next untap step untaps it.

### Baloth Prime: sacrificing a land makes a Beast
- **Do:** Activate Baloth's {4}, Sacrifice a land.
- **Expect:** You get a tapped 4/4 Beast. Baloth loses a stun counter instead of untapping.

### Pugnacious Hammerskull: a stun counter when attacking alone
- **Do:** Attack with Pugnacious Hammerskull, then pass to your next turn.
- **Expect:** It gets a stun counter, and stays tapped through your next untap step, which removes the counter.

### Pugnacious Hammerskull: no counter beside another Dinosaur
- **Do:** Attack with Pugnacious Hammerskull (Ancient Brontodon is on your battlefield).
- **Expect:** It gets no stun counter.

### Junk Winder: each token taps an opponent's permanent
- **Do:** Cast Raise the Alarm and target two of Bob's creatures with the two triggers. Watch Bob's next two untap steps.
- **Expect:** Each trigger taps its target. Those two stay tapped through Bob's next untap step and untap at the one after.

### Neriv, Crackling Vanguard: one card per token name
- **Do:** Attack with Neriv.
- **Expect:** Neriv exiles 3 cards: one each for Goblin, Treasure and Angel. Two tokens with the same name count once, and Bob's Food doesn't count.

### Neriv, Crackling Vanguard: playable the turn it attacked
- **Do:** Attack with Neriv, then try to play the exiled cards that turn.
- **Expect:** You can play them.

### Neriv, Crackling Vanguard: next turn, only after a commander attacks
- **Do:** Attack with Neriv and pass the turn. On your next turn, try to play an exiled card before combat, then attack with Neriv and try again.
- **Expect:** Before the attack they can't be played. After Neriv attacks they can.

### Neriv, Crackling Vanguard: a non-commander Neriv doesn't count
- **Do:** Attack with Neriv but not your commander, Krenko. Try to play the exiled cards.
- **Expect:** They can't be played.

### Neriv, Crackling Vanguard: your commander attacking unlocks them
- **Do:** Attack with Neriv and your commander, Krenko. Try to play the exiled cards.
- **Expect:** You can play them.

### Living Death: creatures swap between graveyard and battlefield
- **Do:** Cast Living Death.
- **Expect:** Grizzly Bears enters under your control and Craw Wurm under Bob's, together. Hill Giant and Serra Angel go to graveyards, and Bob's Island stays put.

### Living Death: a card Rest in Peace exiled stays exiled
- **Do:** Cast Living Death (Bob controls Rest in Peace).
- **Expect:** Grizzly Bears still returns. Hill Giant, exiled by Rest in Peace as it was sacrificed, stays in exile.

## Exiling from the top of a library (2026-10-03, animation)

### Reckless Impulse: exiled cards peel off the library
- **Do:** Cast Reckless Impulse.
- **Expect:** Two cardbacks peel off your library's pile one after another, flaring white-blue. "library N" counts down card by card and "exile N" counts up, and so does the number on the pile itself, rather than vanishing under the peels and jumping. One "−2 exiled" floats up off the top of the pile's card, clear of that number.

### Mystic Forge: the peel covers the revealed top card
- **Do:** Activate Mystic Forge's ability to exile the top card of your library.
- **Expect:** The peel is card-shaped and sits over the revealed top card that Mystic Forge shows.

### Bloodbraid Elf: a cascade's exiles read as one run
- **Do:** Cast Bloodbraid Elf. Your library is stacked so the cascade exiles four lands before it finds Divination.
- **Expect:** The cascade's five one-card exiles read as one run of five, not five cards at once.
- **Not a bug:** The cards the cascade missed going back to the bottom aren't animated: the library count that ran down jumps back when the board lands.

### Outrageous Robbery: cards peel off an opponent's library
- **Do:** Cast Outrageous Robbery with X = 3 targeting Bob.
- **Expect:** Three cardbacks peel off Bob's library pile one after another, his library count running down and his exile count up card by card.

### Watcher for Tomorrow: the hidden card peels off the library
- **Do:** Cast Watcher for Tomorrow and hide a card when it enters.
- **Expect:** The card you hide peels off your library's pile, card-shaped, like any other exile from the top.

### Ulamog, the Ceaseless Hunger: twenty cards exiled from Bob's library
- **Do:** Attack Bob with Ulamog.
- **Expect:** Eight cardbacks peel off Bob's pile while his library count runs down by twenty.

### Pako, Arcane Retriever: every library's top card peels at once
- **Do:** Attack with Pako.
- **Expect:** Every player's library peels its top card, side by side.

### Reckless Impulse: with Reduce motion on, cards fade in place
- **Do:** Turn on "Reduce motion" in Settings, then cast Reckless Impulse.
- **Expect:** The exiled cards fade in place instead of peeling.

## Token stacks folding back (2026-10-03)

### Tribute to the World Tree: new Warriors join one tile
- **Do:** Cast Secure the Wastes for X = 3 (you already have ten 1/1 Warriors). Let Tribute's triggers resolve.
- **Expect:** One ×10 Warrior tile at 1/1 and one ×3 tile at 3/3 with a "+1/+1 2" chip, not three separate 3/3 tiles. Each new Warrior got exactly two counters.
- **Not a bug:** While the triggers resolve, the stack splits off a Warrior at a time; it folds back only once nothing is waiting.

### Tribute to the World Tree: ten new Warriors end on one tile
- **Do:** Cast Secure the Wastes for X = 10 and let Tribute's triggers resolve.
- **Expect:** Once the last trigger resolves, there is one ×10 Warrior tile at 3/3 with its counter chip. No Warrior has four counters or none.

### Basri's Solidarity: one counter per token, counted per token
- **Do:** Cast Basri's Solidarity (you have ten Warriors on one tile and Simic Ascendancy).
- **Expect:** Every Warrior gets one +1/+1 counter. Simic Ascendancy gets one growth counter per Warrior (ten), not one per tile.

### Thalisse, Reverent Medium: one Spirit per token made this turn
- **Do:** Cast Secure the Wastes for X = 3, then pass to your end step.
- **Expect:** Thalisse makes three Spirits, one per token you created this turn.

## Choices on resolution: populate, amass, sacrifice-then (2026-10-03, UI round)

### Trostani: populate offers only your creature tokens
- **Do:** Activate Trostani's populate ability and pick the Soldier.
- **Expect:** A choice on the board appears in the decision banner offering only your Elephant and Soldier tokens (not Bob's token, not Trostani). Picking the Soldier makes a second Soldier, not an Elephant.

### Trostani: populate with one kind of token asks nothing
- **Do:** Activate Trostani's populate ability (you have two identical Soldier tokens).
- **Expect:** Nothing is asked and one more Soldier is made.
- **Not a bug:** Tokens alike in everything but when they were made count as one choice.

### Trostani: gain life equal to an entering creature's toughness
- **Do:** Cast Grizzly Bears.
- **Expect:** As the Bears enter you gain 2 life.

### Saruman: amass asks which Army gets the counters
- **Do:** Cast Divination.
- **Expect:** Saruman's trigger amasses 3: a choice on the board offers the Army token and Changeling Outcast. The one you pick gets three +1/+1 counters and becomes an Orc.

### Saruman: with one Army, amass asks nothing
- **Do:** Cast Divination.
- **Expect:** Nothing is asked; the Army token gets three +1/+1 counters.

### Saruman: a creature spell doesn't amass
- **Do:** Cast Grizzly Bears.
- **Expect:** Saruman doesn't trigger.

### Saruman: your Orc Army has ward {2}
- **Do:** Switch to Bob and cast Shock at your Army token.
- **Expect:** Ward {2} triggers: Shock is countered unless Bob pays {2}.

### Wick: a Rat entering grows the Snail you pick
- **Do:** Cast Muck Rats.
- **Expect:** A choice on the board offers your Snails (only Snails); the one you pick gets a +1/+1 counter.

### Wick: a Rat entering with no Snail makes one
- **Do:** Cast Muck Rats (you have no Snail).
- **Expect:** A 1/1 Snail is made.

### Wick: sacrificing a 3-power Snail
- **Do:** Activate Wick's ability, sacrificing the 3/3 Snail.
- **Expect:** Bob takes 3 damage and you draw 3 cards (the Snail's power as it last existed).

### Breena: an attack on the healthier opponent
- **Do:** Switch to Bob (it's his turn; he has 10 life, Carol 20) and attack Carol with his Grizzly Bears.
- **Expect:** Breena triggers: Bob draws a card, and you are asked (on the board, in your banner, on Bob's turn) which of your creatures gets two +1/+1 counters.

### Breena: no trigger when the attacked player has less life
- **Do:** Switch to Bob (he has 20 life, Carol 10) and attack Carol with his Grizzly Bears.
- **Expect:** Breena doesn't trigger.

### Abdel Adrian: exile any number of your other nonland permanents
- **Do:** Cast Abdel Adrian and choose both Sol Ring and Grizzly Bears.
- **Expect:** The choice offers Sol Ring and the Bears only (never Abdel or a land), any number including none. Each one chosen is exiled and a 1/1 Soldier is made for it.

### Abdel Adrian: exiled cards return when he leaves
- **Do:** Cast Abdel Adrian choosing Sol Ring and Grizzly Bears, then cast Doom Blade on Abdel.
- **Expect:** Sol Ring and the Bears return under your control; the Soldiers stay.

### Abdel Adrian: an exiled token never returns
- **Do:** Cast Abdel Adrian choosing the Elephant token, then cast Doom Blade on Abdel.
- **Expect:** The Elephant still made a Soldier, but it doesn't come back when Abdel dies.

### Ziatora: sacrificing a creature at your end step
- **Do:** Pass to your end step. Say yes to sacrificing, and sacrifice the Grizzly Bears (5/5 with counters).
- **Expect:** Ziatora asks whether to sacrifice another creature (never Ziatora itself). Once you do, a separate ability goes on the stack asking for a target; it deals 5 and you get three Treasures.

### Ziatora: not asked when it's your only creature
- **Do:** Pass to your end step.
- **Expect:** Nothing asks you to sacrifice a creature.

### Felothar: sacrifice a nonland permanent for counters
- **Do:** Cast Felothar and sacrifice Sol Ring when asked.
- **Expect:** Lands aren't offered for the sacrifice. Then every creature you control gets a +1/+1 counter, Felothar included.

### Caesar: sacrifice first, then choose two modes
- **Do:** Attack with Caesar. Say Yes to sacrificing, and sacrifice the Grizzly Bears.
- **Expect:** The Yes/No comes first and never offers Caesar itself. Only after the Bears are sacrificed does a second ability go on the stack, asking for exactly two of the three modes.

### Caesar: the new Soldiers attack and count for the damage
- **Do:** Attack with Caesar, sacrifice the Grizzly Bears, and choose the Soldiers mode and the damage mode.
- **Expect:** Two Soldiers enter tapped and attacking, and the damage counts them. Neither Soldier triggers Caesar again.
- **Not a bug:** With one opponent, the damage mode's target is taken without asking.

### Caesar: with two opponents, the damage mode asks for a target
- **Do:** Attack with Caesar, sacrifice the Grizzly Bears, and choose the Soldiers mode and the damage mode.
- **Expect:** You're asked which opponent the damage mode targets, and you pick whom each Soldier attacks.

### Iron Man: sacrificing Sol Ring finds a 2-mana artifact
- **Do:** Attack with Iron Man and sacrifice Sol Ring when asked.
- **Expect:** A Treasure is made first. The search is for an artifact with mana value exactly 2 (Mind Stone), which enters tapped, and your library is shuffled.

### Iron Man: sacrificing the new Treasure
- **Do:** Attack with Iron Man and sacrifice the Treasure it just made.
- **Expect:** The search is for an artifact with mana value 1: Sol Ring, not Mind Stone.

### Iron Man: declining the sacrifice
- **Do:** Attack with Iron Man and decline to sacrifice.
- **Expect:** The Treasure is still made, and nothing is searched for.

### Eddie Brock: returns only a creature of mana value 1 or less
- **Do:** Cast Eddie Brock.
- **Expect:** Its target offers Llanowar Elves only, not Hill Giant.

### Eddie Brock: transforming into Venom
- **Do:** In your main phase, activate Eddie Brock's transform ability.
- **Expect:** It's offered only at sorcery speed. Eddie becomes Venom, a 5/5 with menace, trample and haste.

### Venom: sacrificing Hill Giant draws four
- **Do:** Transform Eddie Brock, attack with Venom, and sacrifice the Hill Giant when asked.
- **Expect:** You draw four, then you may put a permanent card of mana value 4 or less from your hand onto the battlefield (Grizzly Bears yes, Craw Wurm no), or none.

### Yuma: costs {1} less per land in your graveyard
- **Do:** Look at Yuma's cost in your hand (three lands in your graveyard) and cast it.
- **Expect:** It costs five mana.

### Yuma: sacrificing a Desert draws and makes a Plant
- **Do:** Cast Yuma; when it enters, sacrifice Desert of the True.
- **Expect:** You draw a card, and the Desert going to your graveyard makes a 4/2 Plant Warrior with reach.

### Yuma: a milled Desert makes a Plant
- **Do:** Cast Thought Scour on yourself (Desert of the True is on top of your library).
- **Expect:** The Desert is milled and a 4/2 Plant Warrior with reach is made.

### Yuma: a discarded Desert makes a Plant
- **Do:** Cycle Desert of the True from your hand.
- **Expect:** A 4/2 Plant Warrior with reach is made.

## Free casts: cascade and suspend cast whole (2026-10-03, UI round)

### Bloodbraid Elf: cascade offers Kolaghan's Command's full cast
- **Do:** Cast Bloodbraid Elf and look at the offer when the cascade finds Kolaghan's Command.
- **Expect:** It asks for two of its four modes and their targets, and declining is possible. The Command is cast before the Forest the cascade passed over goes to the bottom.

### Bloodbraid Elf: cascade offers Orim's Chant kicked or not
- **Do:** Cast Bloodbraid Elf and look at the offer when the cascade finds Orim's Chant.
- **Expect:** Orim's Chant is offered kicked (paying the kicker's {W}) and unkicked.

### Bloodbraid Elf: a card that can't be cast isn't offered
- **Do:** Cast Bloodbraid Elf (Murder is on top of your library and there's no creature to target).
- **Expect:** Murder isn't offered and goes to the bottom.

### Rift Bolt: cast free from suspend
- **Do:** Suspend Rift Bolt from your hand (pay {R}), then pass to your next upkeep.
- **Expect:** "Remove a time counter" goes on the stack (the counter still on the card while it waits, and you can respond), then "when the last is removed, you may play it". As that resolves you're offered Rift Bolt's free cast, choosing its target.

### Rift Bolt: declining the suspend cast
- **Do:** Suspend Rift Bolt, pass to your next upkeep, and decline the free cast.
- **Expect:** Rift Bolt stays in exile with no counters, no longer suspended.

### Maelstrom Wanderer: two cascades, one after the other
- **Do:** Cast Maelstrom Wanderer.
- **Expect:** It cascades twice, both looking for mana value under 8. The first spell resolves before the second cascade exiles anything.

### The First Sliver: Sliver spells cascade
- **Do:** Cast Metallic Sliver.
- **Expect:** It cascades, finding Memnite.

### The First Sliver: a non-Sliver spell doesn't cascade
- **Do:** Cast Grizzly Bears.
- **Expect:** No cascade.

### Imoti: a spell of mana value 6 or more cascades
- **Do:** Cast Craw Wurm.
- **Expect:** It cascades.

### Imoti: a smaller spell doesn't cascade
- **Do:** Cast Grizzly Bears.
- **Expect:** No cascade.

### Zhulodok: a colorless 7+ spell from hand cascades twice
- **Do:** Cast Ulamog, the Ceaseless Hunger from your hand.
- **Expect:** It cascades twice.

### Yidris: spells cast after combat damage gain cascade
- **Do:** Attack Bob with Yidris, unblocked. After combat damage, cast Grizzly Bears.
- **Expect:** The Bears have cascade.

### Yidris: cascade stays after Yidris leaves
- **Do:** Attack Bob with Yidris, unblocked. After combat damage, cast Unsummon on Yidris, then cast Grizzly Bears.
- **Expect:** The Bears still have cascade for the rest of the turn.

### Yidris: no cascade next turn
- **Do:** Attack Bob with Yidris, unblocked. Pass to your next turn and cast Grizzly Bears.
- **Expect:** No cascade.

### Jodah: a legendary spell from hand finds a lesser legend
- **Do:** Cast Krenko, Mob Boss from your hand.
- **Expect:** Cards are exiled until a legendary nonland card of lesser mana value (Isamaru); you're offered its free cast.

### Jodah: a declined card stays in exile
- **Do:** Cast Krenko, Mob Boss from your hand and decline Isamaru's free cast.
- **Expect:** Isamaru stays in exile (unlike cascade), and the other exiled cards go to the bottom in a random order.

### Jodah: a nonlegendary spell doesn't trigger
- **Do:** Cast Grizzly Bears.
- **Expect:** Jodah doesn't trigger.

### Jodah: legendary creatures get +X/+X
- **Do:** Look at Jodah and Isamaru on your battlefield.
- **Expect:** Each gets +2/+2, one for each legendary creature you control.

## Harmonize and blitz (2026-10-03)

### Zenith Festival: harmonize offers only your untapped creature
- **Do:** Open Zenith Festival in your graveyard.
- **Expect:** It offers a harmonize cast tapping nothing and one "tapping Hill Giant (−3)", never your tapped Craw Wurm or Bob's creature.

### Zenith Festival: harmonize tapping Hill Giant at X = 4
- **Do:** Cast Zenith Festival from your graveyard "tapping Hill Giant (−3)" with X = 4.
- **Expect:** It costs {1}{R}{R}: the Giant taps and can't also pay as mana, and the coloured part never shrinks. Four cards are exiled to play until your next turn, and Zenith Festival is exiled, not returned to the graveyard.

### Nature's Rhythm: harmonize searches for mana value X or less
- **Do:** Cast Nature's Rhythm from your graveyard "tapping Hill Giant" with X = 2.
- **Expect:** The search offers a creature of mana value 2 or less (Grizzly Bears, not Craw Wurm). Nature's Rhythm is exiled afterwards.

### Star Athlete: blitzed, it attacks and is sacrificed at end step
- **Do:** Cast Star Athlete "(blitz)" and attack Bob with it, choosing no target. Let the turn end.
- **Expect:** It attacks the turn it's cast (haste). At your end step it's sacrificed and you draw a card.

### Star Athlete: the opponent sacrifices the target
- **Do:** Blitz Star Athlete, attack, and target Bob's Hill Giant. Switch to Bob and choose to sacrifice it.
- **Expect:** The Hill Giant is sacrificed and Bob takes no damage.

### Star Athlete: the opponent keeps the target
- **Do:** Blitz Star Athlete, attack, and target Bob's Hill Giant. Switch to Bob and choose not to sacrifice it.
- **Expect:** Bob takes 5 damage.

### Star Athlete: cast normally, it has no haste and stays
- **Do:** Cast Star Athlete normally for {1}{R}{R}, then pass to your end step.
- **Expect:** It can't attack this turn, and it isn't sacrificed at the end step.

### Jaxis: copying another creature
- **Do:** Activate Jaxis in your main phase, discarding the Forest and targeting Hill Giant. Let the turn end.
- **Expect:** Jaxis can't target itself. The token copy has haste, is sacrificed at the end step, and you draw a card as it dies.

### Jaxis: blitz from the command zone
- **Do:** Look at Jaxis's cast options in the command zone.
- **Expect:** It can be blitzed for {1}{R} plus commander tax.

### Henzie: only a creature of mana value 4+ gets blitz
- **Do:** Look at the cast options for Craw Wurm and Grizzly Bears.
- **Expect:** Only Craw Wurm has a "(blitz)" cast.

### Henzie: blitz costs {1} less per commander cast
- **Do:** Cast Krenko, Mob Boss from the command zone, then look at Craw Wurm's "(blitz)" cast.
- **Expect:** Its blitz cost is its mana cost less {1}.

### Henzie: a blitzed creature
- **Do:** Cast Craw Wurm "(blitz)", attack with it, and let the turn end.
- **Expect:** It has haste. At the end step it's sacrificed and you draw a card as it dies.

## Curses: Auras that enchant a player (2026-10-05)

### Curse of Opulence: enchanting a player
- **Do:** Cast Curse of Opulence at Carol (click her panel).
- **Expect:** The Curse sits on your board flagged "→ carol", and Carol's panel carries its art chip ringed in your colour.

### Curse of Opulence: attacking the cursed player makes Gold
- **Do:** Cast Curse of Opulence at Carol. Pass to Bob's turn, switch to Bob and attack Carol with both Grizzly Bears.
- **Expect:** The trigger goes on the stack once (two attackers, one trigger): you and Bob each get one Gold token, Carol none.

### Gold token: sacrifice for mana
- **Do:** Cast Opt, paying with the Gold token.
- **Expect:** The Gold is sacrificed for one mana of any colour, without tapping.

### Curse of Opulence: attacking someone else doesn't trigger
- **Do:** Cast Curse of Opulence at Carol. Pass to Bob's turn, switch to Bob and attack yourself (Alice) with both Grizzly Bears.
- **Expect:** The Curse doesn't trigger.

### Curse of Opulence: attacking only a planeswalker doesn't trigger
- **Do:** Cast Curse of Opulence at Carol. Pass to Bob's turn, switch to Bob and attack only Carol's Ajani with both Grizzly Bears.
- **Expect:** The Curse doesn't trigger.

### Curse of Verbosity: attacking the cursed player draws
- **Do:** Cast Curse of Verbosity at Carol. Pass to Bob's turn, switch to Bob and attack Carol.
- **Expect:** The trigger goes on the stack once: you and Bob each draw a card, Carol doesn't.

### Curse of Bounty: attacking the cursed player untaps
- **Do:** Cast Curse of Bounty at Carol. Pass to Bob's turn, switch to Bob and attack Carol.
- **Expect:** The trigger goes on the stack once: you untap your nonland permanents (your Mind Stone), and Bob untaps his.

### Curse of Disturbance: attacking the cursed player makes Zombies
- **Do:** Cast Curse of Disturbance at Carol. Pass to Bob's turn, switch to Bob and attack Carol.
- **Expect:** The trigger goes on the stack once: you and Bob each get a 2/2 Zombie, Carol none.

### Trespasser's Curse: a creature entering under Bob drains him
- **Do:** Cast Trespasser's Curse at Bob. On Bob's turn, switch to Bob and cast Grizzly Bears.
- **Expect:** As the Bears enter, Bob loses 1 life and you gain 1.

### Trespasser's Curse: your own creature does nothing
- **Do:** Cast Trespasser's Curse at Bob, then cast Grizzly Bears yourself.
- **Expect:** Nothing triggers.

### Trespasser's Curse: Bob's noncreature permanent does nothing
- **Do:** Cast Trespasser's Curse at Bob. On Bob's turn, switch to Bob and cast Mind Stone.
- **Expect:** Nothing triggers.

### Archon of Falling Stars: a returned Curse asks for a player
- **Do:** Cast Murder on your Archon and return Curse of Verbosity with its trigger.
- **Expect:** The decision banner asks you to click the player it enchants, and the players' panels light up (no permanent does). It enters attached to the player you click.

## Demonstrate (2026-10-05)

### Transforming Flourish: demonstrate puts two copies on the stack
- **Do:** Cast Transforming Flourish at Bob's Grizzly Bears and say yes to demonstrate. Move your copy to Carol's Hill Giant and choose Bob as the opponent. Switch to Bob and move his copy to your Runeclaw Bear.
- **Expect:** The stack reads, top first: Bob's copy, your copy, the spell.

### Transforming Flourish: each copy resolves for its own target
- **Do:** Set up the copies as above (yours at Carol's Hill Giant, Bob's at your Runeclaw Bear) and let all three resolve.
- **Expect:** Bob's copy destroys your Bear, and you exile from your library down to a nonland card and are offered it free. Your copy destroys Carol's Giant and Carol is offered hers. The spell destroys Bob's Bears; Bob exiles the Forest and is offered the Lightning Bolt.

### Transforming Flourish: declining demonstrate makes no copies
- **Do:** Cast Transforming Flourish at Bob's Grizzly Bears and decline demonstrate.
- **Expect:** No copies are made; only the spell is on the stack.

### Creative Technique: revealed lands go to the bottom
- **Do:** Cast Creative Technique and decline demonstrate.
- **Expect:** The lands it revealed go to the bottom of your library, not to exile.

## The TDC precons' last cards (2026-10-07)

### Slaughter the Strong: picking creatures under the power cap
- **Do:** Cast Slaughter the Strong. Click Hill Giant, then Grizzly Bears.
- **Expect:** The banner reads "total power N/4" as you pick, and Confirm is greyed out past 4 (the Giant and the Bears together).

### Slaughter the Strong: each player chooses in turn
- **Do:** Cast Slaughter the Strong and choose your creatures to keep. Then switch to Bob and choose his.
- **Expect:** You're asked first, then Bob, then Carol, each only about their own creatures. Nothing dies until all three have chosen; then everything not kept goes at once.

### Shadrix Silverquill: choose exactly two modes
- **Do:** Move to combat. At the trigger, look at the mode choice.
- **Expect:** The banner reads "you may choose 2", and Confirm needs exactly two.

### Shadrix Silverquill: "Choose none" removes the trigger
- **Do:** Move to combat and click "Choose none" at the trigger.
- **Expect:** The trigger is removed and nothing happens.

### Shadrix Silverquill: the two modes target different players
- **Do:** Move to combat, pick two modes and aim the first at Bob.
- **Expect:** The second mode can't target Bob.

### Shadrix Silverquill: counters only on the chosen player's creatures
- **Do:** Move to combat. Choose "Target player puts a +1/+1 counter on each creature they control" aimed at Bob, and another mode aimed at yourself.
- **Expect:** Only Bob's Hill Giant gets a +1/+1 counter; your creatures get none from that mode.

### Leyline Tyrant: red mana stays in your pool
- **Do:** Tap two Mountains and a Forest for mana, then pass to the next step.
- **Expect:** The two red mana stay in your pool across steps (and into the next turn) while the Tyrant is out. The green mana empties as usual.

### Leyline Tyrant: paying red mana as it dies
- **Do:** Tap two Mountains for {R}{R}, then cast Murder on your own Tyrant.
- **Expect:** As it dies you're asked to pay, with X offered only as high as your red mana goes (the Forests don't count). Paying asks for a target, which takes that much damage.

### Life from the Loam: dredge is offered before each draw
- **Do:** Cast Divination.
- **Expect:** Before each of the two draws you're asked "Draw a card" or "Dredge 3: mill 3, return Life from the Loam to your hand", the second question after the first is answered. Dredging mills three and puts the Loam in your hand instead of drawing.

### Life from the Loam: no dredge with under three cards in library
- **Do:** Cast Divination (your library has two cards).
- **Expect:** Dredge isn't offered.

### Life from the Loam: dredge is offered at your draw step
- **Do:** Move from your upkeep to your draw step.
- **Expect:** You're asked "Draw a card" or "Dredge 3: mill 3, return Life from the Loam to your hand".

## Exchanging text boxes (2026-10-09)

### Deadpool: the exchange is asked as he enters
- **Do:** Cast Deadpool and decline the exchange.
- **Expect:** The prompt comes before Deadpool is on the battlefield, offers every other creature, and lets you choose none. Declined, nothing changes.

### Deadpool: exchanging text boxes with Serra Angel
- **Do:** Cast Deadpool and pick Bob's Serra Angel when asked.
- **Expect:** Deadpool is still a 5/3 Mutant Mercenary Hero but has flying and vigilance and no text of his own. The Angel is a 4/4 Angel with no keywords whose card reads "As Deadpool enters …". The log says the two exchanged text boxes.

### Deadpool: Bob loses life at his upkeep
- **Do:** Cast Deadpool and exchange with Bob's Serra Angel. Pass to Bob's turn.
- **Expect:** At Bob's upkeep, Bob loses 3 life.

### Deadpool: Bob sacrifices the Angel to make you draw
- **Do:** Cast Deadpool and exchange with Bob's Serra Angel. Switch to Bob, pay {3} and sacrifice the Angel with its new ability.
- **Expect:** You draw a card.

## Face-down permanents (2026-10-09)

### Reality Shift: your manifested creature, from your seat
- **Do:** Cast Reality Shift on your own Grizzly Bears.
- **Expect:** The Bears are exiled and you get a face-down 2/2 reading "Manifested: Elvish Visionary". You don't draw a card.

### Reality Shift: an opponent's manifest hides its name
- **Do:** Cast Reality Shift on Bob's Grizzly Bears.
- **Expect:** Bob gets a face-down 2/2: a card-back tile in his seat colour reading "Face-down (manifested)". The hover card shows no name, text or cost, and the log never names it.

### Reality Shift: turning a manifested creature face up
- **Do:** Cast Reality Shift on your own Grizzly Bears. Open the face-down creature's ability menu and turn it face up.
- **Expect:** The menu offers "Turn face up — Elvish Visionary, pay {1}{G}". It becomes a 1/1 Elf with no card drawn, and the log names it from then on.

### Reality Shift: a face-down creature is revealed as it dies
- **Do:** Cast Reality Shift on your own Grizzly Bears, then cast Murder on the face-down creature.
- **Expect:** It's revealed (Elvish Visionary) as it goes to the graveyard.

### Reality Shift: a face-down land can't be turned face up
- **Do:** Cast Reality Shift on your own Grizzly Bears (a Forest is on top of your library). Open the face-down creature's ability menu.
- **Expect:** No "Turn face up" is offered.

## Emblems with triggered abilities, and a turn-long graveyard permission (2026-10-09)

### Ob Nixilis Reignited: Bob's emblem hurts him when he draws
- **Do:** Activate Ob Nixilis's −8 targeting Bob. Pass to Bob's turn and watch his draw.
- **Expect:** Bob's emblem list shows "Whenever a player draws a card, you lose 2 life". When Bob draws, the stack shows the Ob Nixilis emblem's ability, and Bob loses 2 life.

### Ob Nixilis Reignited: Bob loses life when you draw
- **Do:** Activate Ob Nixilis's −8 targeting Bob, then cast Divination.
- **Expect:** Bob loses 2 life for each card you draw.

### Koth: the emblem deals 4 when a Mountain enters
- **Do:** Activate Koth's −7. Play the Mountain from your hand and pick Bob as the target.
- **Expect:** Your emblem list shows Koth's emblem. Playing the Mountain puts "Emblem's ability" on the stack, reading "Whenever a Mountain you control enters, this emblem deals 4 damage to any target"; Bob takes 4.

### Liliana: Zombies castable from your graveyard
- **Do:** Activate Liliana's −3 and look at your graveyard.
- **Expect:** Diregraf Ghoul can be cast from your graveyard (paying {B}); Grizzly Bears can't.

### Liliana: a Zombie that reaches the graveyard later is castable too
- **Do:** Activate Liliana's −3. Cast the Diregraf Ghoul from your hand, cast Village Rites sacrificing it, then look at your graveyard.
- **Expect:** That Ghoul can be cast from your graveyard as well.

### Liliana: the permission ends with the turn
- **Do:** Activate Liliana's −3, then pass to your next turn.
- **Expect:** Diregraf Ghoul is no longer offered from your graveyard.

## Crew and Vehicles (2026-10-09)

### Cultivator's Caravan: crew counts total power
- **Do:** Activate Cultivator's Caravan's crew 3: tap Grizzly Bears alone, then add Llanowar Elves, then confirm.
- **Expect:** The banner reads "tap creatures with total power 3 — power 2/3" with the Bears picked and Confirm disabled; with the Elves it reads 3/3 and Confirm works. The crewed Caravan shows as a 5/5 artifact creature.

### Smuggler's Copter: a summoning-sick creature can crew
- **Do:** Crew Smuggler's Copter with the summoning-sick Hill Giant, then attack with the Copter.
- **Expect:** The Giant crews it. The Copter attacks (a Vehicle that's been yours all turn isn't summoning sick) and offers its loot.

### Kotori: Vehicles get crew 2
- **Do:** Open the ability menus of Smuggler's Copter and Cultivator's Caravan.
- **Expect:** Each has crew 2 beside its own crew. Neither Vehicle is ever offered to tap for its own crew.

### Smuggler's Copter: a crewed Vehicle reverts next turn
- **Do:** Crew Smuggler's Copter with Grizzly Bears, then pass to your next turn.
- **Expect:** The Copter is a noncreature artifact again.

## The Ring tempts you (2026-10-09)

### Claim the Precious: choosing a Ring-bearer
- **Do:** Cast Claim the Precious on Bob's Serra Angel; when asked, choose Hill Giant.
- **Expect:** The banner reads "The Ring tempts you: choose your Ring-bearer". The Hill Giant wears a "Ring" chip and is legendary.

### Birthday Escape: a second temptation moves the Ring
- **Do:** Cast Claim the Precious on Bob's Serra Angel and choose Hill Giant. Then cast Birthday Escape and choose Grizzly Bears. Look at your emblems and the log.
- **Expect:** The "Ring" chip moves to the Bears. Your emblems show one Ring emblem, its text grown to the loot line, and the emblem viewer reads "Emblem — The Ring". The log reads "The Ring tempts Alice (2 times) — Grizzly Bears is the Ring-bearer".

### The Ring: a twice-tempted Ring-bearer loots as it attacks
- **Do:** Cast Claim the Precious and Birthday Escape, choosing Grizzly Bears both times. Attack with the Bears.
- **Expect:** The Bears loot: you draw a card, then discard one.

### The Ring: no blocks from greater power
- **Do:** Cast Claim the Precious on Bob's Serra Angel and choose Grizzly Bears. Attack Bob with the Bears, then switch to Bob to block.
- **Expect:** Bob may block the Bears with Llanowar Elves but not with his Hill Giant (greater power).

## Rolling dice (2026-10-09)

### Clown Car: rolling four dice
- **Do:** Cast Clown Car with X = 4.
- **Expect:** Four six-sided dice in your colour are thrown in from your side, bounce and settle; the caption reads "Alice rolls 4d6: a, b, c, d — total". A Clown Robot appears for each odd die and the Car gets a +1/+1 counter for each even one, and the log names every result.

### Brazen Dwarf: one damage for the whole roll
- **Do:** Cast Clown Car with X = 4.
- **Expect:** Bob loses 1 life to Brazen Dwarf for the roll, once, not four times.

### Hoarding Ogre: Treasures by the d20 table
- **Do:** Attack Bob with Hoarding Ogre.
- **Expect:** Its d20 lands, and its Treasures match the table: 1–9 one, 10–19 two, 20 three.

### Ancient Copper Dragon: Treasures equal to the d20
- **Do:** Attack Bob with Ancient Copper Dragon, unblocked.
- **Expect:** On combat damage its d20 lands and you get that many Treasures.

### Clown Car: with Reduce motion on, dice appear in place
- **Do:** Turn on "Reduce motion" in Settings, then cast Clown Car with X = 2.
- **Expect:** The dice appear in place, already showing their results.

## Casting copies of cards (2026-10-09)

### Isochron Scepter: each activation casts a free Bolt
- **Do:** Cast Isochron Scepter and exile Lightning Bolt with it. Activate it, aiming the copy at Bob.
- **Expect:** You're offered a Lightning Bolt to cast free and Bob loses 3. The imprinted Bolt stays in exile under the Scepter.

### Mnemonic Deluge: three copies, one declined
- **Do:** Cast Mnemonic Deluge on Bob's Divination. Cast two of the copies and decline the third.
- **Expect:** A Divination is offered three times, one after another, and the two casts draw four cards. After declining, no extra Divination is left in exile, only the original, and Mnemonic Deluge itself is in exile.

### Narset: a copy of Sol Ring becomes a token
- **Do:** Attack with Narset, targeting the Sol Ring in Bob's graveyard, and cast the copy.
- **Expect:** The copy resolves as a Sol Ring token under your control; the card stays in exile.

## Ninjutsu (2026-10-09)

### Ninja of the Deep Hours: no ninjutsu before blockers
- **Do:** Attack Bob with Grizzly Bears. Before blockers are declared, open Ninja of the Deep Hours' menu in your hand.
- **Expect:** Ninjutsu isn't offered.

### Ninja of the Deep Hours: only an unblocked attacker returns
- **Do:** Attack Bob with Grizzly Bears and Llanowar Elves. Switch to Bob and block the Elves with Drift of Phantasms. Back as Alice, use the Ninja's ninjutsu.
- **Expect:** Only the Bears can be returned. The Ninja is revealed, the Bears go back to your hand, and the Ninja comes in tapped and attacking Bob, unblocked. On combat damage it asks whether to draw a card.

### Ninja of the Deep Hours: two unblocked attackers, you choose
- **Do:** Attack Bob with Grizzly Bears and Llanowar Elves, unblocked, and use the Ninja's ninjutsu.
- **Expect:** You choose on the board which attacker goes back to your hand.

### Yuriko: commander ninjutsu from the command zone
- **Do:** Attack Bob with Grizzly Bears, unblocked, and use Yuriko's commander ninjutsu from the command zone.
- **Expect:** Yuriko comes in without commander tax. On combat damage her trigger reveals the Hill Giant, puts it into your hand, and Bob loses 4 more.

## Rooms (2026-10-09)

### Unholy Annex: a locked Room on the board
- **Do:** Look at the Room on your battlefield and hover it.
- **Expect:** Its tile reads "🔒 Unholy Annex // Ritual Chamber", and its hover card shows both doors dimmed with locks.

### Unholy Annex: unlocking a door
- **Do:** Open the Room's menu and unlock Unholy Annex ({2}{B}). Then open the menu again.
- **Expect:** The menu offers "Unlock … — pay …" for each locked door. Once unlocked, that door's lock opens, its text brightens and the tile names it, and its Unlock is no longer offered.

### Unholy Annex: no unlocking during combat
- **Do:** Attack with Grizzly Bears and open the Room's menu during combat.
- **Expect:** No Unlock is offered.

### Bottomless Pool: two ways to cast a Room
- **Do:** Open Bottomless Pool // Locker Room in your hand.
- **Expect:** It offers "Cast Bottomless Pool" and "Cast Locker Room".

### Bottomless Pool: its unlock trigger fires as it enters
- **Do:** Cast it as Bottomless Pool.
- **Expect:** Bottomless Pool's "when you unlock this door" triggers as it enters; it returns Bob's Hill Giant to his hand.

### Ritual Chamber: unlocking makes a Demon
- **Do:** Unlock Ritual Chamber ({3}{B}{B}).
- **Expect:** You get a 6/6 flying Demon.

### Unholy Annex: without a Demon it costs you life
- **Do:** Unlock Unholy Annex, then pass to your end step.
- **Expect:** At your end step you lose 2 life.

### Unholy Annex: with a Demon it drains
- **Do:** Unlock Ritual Chamber, then Unholy Annex. Pass to your end step.
- **Expect:** At your end step Bob loses 2 life and you gain 2, instead of you losing 2.

## Class levels (2026-10-10)

### Paladin Class: starts at level 1
- **Do:** Look at Paladin Class's tile and hover it, then open its menu.
- **Expect:** The tile wears a "Lv 1" chip and the hover card reads "level 1". The menu offers only "Level 2".

### Paladin Class: gaining level 2
- **Do:** Gain level 2 ({2}{W}), then open the menu again.
- **Expect:** The chip reads "Lv 2", Grizzly Bears become 3/3 and Llanowar Elves 2/2. The menu now offers "Level 3".

### Paladin Class: no levelling during combat
- **Do:** Attack Bob with Grizzly Bears and open Paladin Class's menu during combat.
- **Expect:** No level is offered.

### Paladin Class: level 3's attack trigger
- **Do:** Gain level 2, then level 3 ({4}{W}). Attack Bob with both creatures and target the Bears with the trigger. Open the menu once more.
- **Expect:** Attacking asks for the trigger's target, and the Bears get +1/+1 more and double strike (4/4, dealing 8). The menu offers no more levels.

## Morph, disguise and manifest dread (2026-10-10)

### Den Protector: cast face up or face down
- **Do:** Click Den Protector in your hand.
- **Expect:** It offers "Cast Den Protector" and "Cast Den Protector face down (a 2/2 for {3})".

### Den Protector: a face-down card's name is hidden from Bob
- **Do:** Cast Den Protector face down. Look at the spell and then the permanent. Then switch to Bob and look again, and at the log.
- **Expect:** To you the spell and the permanent read "Morph: Den Protector". In Bob's view and in the log they read "Face-down (morph)".

### Trail of Mystery: a face-down creature finds a basic land
- **Do:** Cast Den Protector face down. Let Trail of Mystery's trigger search your library and pick the Forest.
- **Expect:** Trail of Mystery triggers as the face-down 2/2 enters, and the Forest goes to your hand.

### Den Protector: turned face up only for its megamorph cost
- **Do:** Cast Den Protector face down, then open the face-down creature's menu.
- **Expect:** It offers only "Turn face up — Den Protector, megamorph {1}{G}", never a way to turn it up for its mana cost.

### Den Protector: turned face up with Trail of Mystery
- **Do:** Cast Den Protector face down, then turn it face up for its megamorph cost. Pick Grizzly Bears for its trigger.
- **Expect:** It's a 3/2 with a +1/+1 counter, and Trail of Mystery makes it 5/4 until end of turn. Its trigger asks for a card in your graveyard, and Grizzly Bears returns to your hand.

### Arno Dorian: face down with disguise shows ward {2}
- **Do:** Cast Arno Dorian face down.
- **Expect:** The face-down 2/2 shows ward {2}.

### Arno Dorian: turned face up for its disguise cost
- **Do:** Cast Arno Dorian face down, then open its menu and turn it face up for its disguise cost.
- **Expect:** Arno Dorian is face up: a 3/3 with deathtouch.

### Unwanted Remake: the creature's controller manifests dread
- **Do:** Cast Unwanted Remake on Bob's Hill Giant.
- **Expect:** Bob manifests one of the top two cards of his library and the other goes to his graveyard. You see only a face-down 2/2.

### They Came from the Pipes: manifest dread twice
- **Do:** Cast They Came from the Pipes. Answer each prompt by picking one of the two cards.
- **Expect:** You're asked twice, "Manifest dread: choose a card…", each time over your next two cards. Each chosen card enters face down ("Manifested: …" to you) and you draw a card; the other card goes to your graveyard.

### Way of the Pyromancer: a Jace token, and +1: Add {R} for planeswalkers
- **Do:** Cast Way of the Pyromancer. Open the Jace token's menu, then Chandra's.
- **Expect:** Way's trigger creates a blue Jace planeswalker token with 2 loyalty (−1: Surveil 1, −3: Draw a card). The Jace token and Chandra each show "+1: Add {R}" beside their own abilities.

### Way of the Pyromancer: the granted +1: Add {R} uses the stack
- **Do:** Cast Way of the Pyromancer. Activate the Jace token's "+1: Add {R}" and let it resolve. Cast Lightning Bolt at Bob's Hill Giant with the {R}.
- **Expect:** The ability goes on the stack (the stack shows it and Bob gets priority) and the token goes up to 3 loyalty. Once it resolves the {R} is in your pool and pays for Lightning Bolt.
- **Not a bug:** This "add mana" ability isn't a mana ability, because it's a loyalty ability.

### Way of the Pyromancer: one loyalty ability per planeswalker a turn
- **Do:** Cast Way of the Pyromancer and activate the Jace token's "+1: Add {R}". Then open the Jace token's menu and Chandra's.
- **Expect:** The Jace token offers no other loyalty ability this turn. Chandra still offers all of hers.

### Studious First-Year: casting its prepared Rampant Growth
- **Do:** Open Studious First-Year's menu and cast "Rampant Growth (prepared)". Find a Forest.
- **Expect:** First-Year shows a "Prep" flag and its menu offers the cast. The spell on the stack is a copy of Rampant Growth, with Rampant Growth's own art. Once it's cast the flag is gone and the menu offers nothing. After it resolves, no Rampant Growth is in your graveyard.

### Carnivorous Cultivator: enters prepared
- **Do:** Cast Carnivorous Cultivator. Once it's on the battlefield, open its menu.
- **Expect:** It enters with the "Prep" flag and its menu offers "Cast Enroot (prepared)".

### Studious First-Year: no prepared cast on Bob's turn
- **Do:** It's Bob's turn. When you get priority, open Studious First-Year's menu.
- **Expect:** It doesn't offer "Rampant Growth (prepared)": it's a sorcery.

### Raphael, the Nightwatcher: no sneak cast before blockers
- **Do:** Attack Bob with Grizzly Bears. Before blockers are declared, look at Raphael and at Shredder's Technique in your hand.
- **Expect:** Neither card offers a sneak cast yet.

### Raphael, the Nightwatcher: sneak cast returns the attacker
- **Do:** Attack Bob with Grizzly Bears. In the declare blockers step, cast Raphael "(sneak, returning Grizzly Bears)".
- **Expect:** Grizzly Bears goes back to your hand. Raphael enters tapped and attacking Bob, and deals 2 damage twice (double strike).

### Shredder's Technique: a sneak sorcery in the declare blockers step
- **Do:** Attack Bob with Grizzly Bears. In the declare blockers step, cast Shredder's Technique with sneak on Bob's Glorious Anthem.
- **Expect:** It can be cast in the declare blockers step for {B}. Glorious Anthem is destroyed and you lose 2 life.

### Raphael, the Nightwatcher: attacks whoever the returned creature did
- **Do:** In this 4-player game, attack Carol with Grizzly Bears. In the declare blockers step, cast Raphael "(sneak, returning Grizzly Bears)".
- **Expect:** Raphael enters tapped and attacking Carol.

### HULK SMASH!: teamwork needs total power 4
- **Do:** Click HULK SMASH! in your hand and choose the "(teamwork)" cast. Pick Hill Giant alone, then add Grizzly Bears.
- **Expect:** The cast menu offers HULK SMASH! plain and "(teamwork)". The teamwork cast asks for creatures with total power 4: Hill Giant alone isn't enough, both are.

### HULK SMASH!: with teamwork, both modes
- **Do:** Cast HULK SMASH! with teamwork, tapping Grizzly Bears and Hill Giant. Choose both modes: Sol Ring, and your Hill Giant dealing damage to Bob's Grizzly Bears.
- **Expect:** It asks for exactly two modes. Sol Ring and Bob's Grizzly Bears are destroyed, and your two creatures are tapped.

### Too Evil to Stay Dead: without teamwork, only mana value 4 or less
- **Do:** Cast Too Evil to Stay Dead without teamwork.
- **Expect:** Grizzly Bears in your graveyard can be targeted; Craw Wurm (mana value 6) can't.

### Too Evil to Stay Dead: with teamwork, any creature card
- **Do:** Cast Too Evil to Stay Dead with teamwork, tapping Grizzly Bears and Hill Giant, and target Craw Wurm in your graveyard.
- **Expect:** Craw Wurm can be targeted and returns to the battlefield.

### Fíli the Pathfinder: two of three isn't an enduring story
- **Do:** Cast Sol Ring.
- **Expect:** With only Fíli and Sol Ring (two of three), nothing changes: no 📜 on your panel and Fíli isn't boosted.

### Fíli the Pathfinder: the third makes an enduring story
- **Do:** Cast Sol Ring, then Bifur, Melodic Rider.
- **Expect:** Once Bifur is down, your panel shows a 📜 and the log says you have an enduring story. Your creatures get +1/+1 from Fíli.

### Bifur, Melodic Rider: Fíli's Dwarf trigger happens twice
- **Do:** Cast Sol Ring, then Bifur, then Dáin's Company.
- **Expect:** Dáin's Company, a nontoken Dwarf, makes Fíli create two 2/2 red Dwarf tokens, not one.

### Fíli the Pathfinder: the enduring story stays
- **Do:** Cast Sol Ring, then Bifur, Melodic Rider. Once the 📜 shows, cast Unsummon on Bifur.
- **Expect:** The 📜 stays on your panel after Bifur leaves.

### Gristle Glutton: blight 1 as part of its cost
- **Do:** Activate Gristle Glutton and pick Grizzly Bears for the blight. Discard the Forest.
- **Expect:** It asks "Blight 1 — put a -1/-1 counter on a creature you control" and offers only your creatures, not Bob's. The counter lands on your Grizzly Bears, which becomes 1/1.

### Bogslither's Embrace: blight 1 or pay {3}
- **Do:** Cast Bogslither's Embrace on Bob's Hill Giant, choosing "blight 1" rather than paying {3}. Pick your Grizzly Bears.
- **Expect:** The cast menu offers both the blight and the pay-{3} version. Your Grizzly Bears gets a -1/-1 counter and Bob's Hill Giant is exiled.

### Burning Curiosity: blighting exiles three cards
- **Do:** Cast Burning Curiosity "(blight 1)" and pick your Grizzly Bears.
- **Expect:** The cast menu offers it plain and "(blight 1)". The blight version exiles three cards, which you may play until the end of your next turn.

### Burning Curiosity: no blight version without a creature
- **Do:** Click Burning Curiosity in your hand.
- **Expect:** Only the plain cast is offered: with no creature, there's no blight version.

### High Perfect Morcant: each opponent blights their own creature
- **Do:** Cast High Perfect Morcant.
- **Expect:** Bob puts a -1/-1 counter on one of his own creatures (his choice), not on yours.

### Champion of the Weird: behold a Goblin from hand or battlefield
- **Do:** Cast Champion of the Weird and look at the behold choice. Pick the Gristle Glutton in your hand.
- **Expect:** It offers both Gristle Gluttons: the one in your hand and the one on the battlefield. The chosen one is exiled, and the log says you revealed it.
- **Not a bug:** If you behold the Gristle Glutton on the battlefield instead, the log has no line for it.

### Champion of the Weird: the beheld card comes back when it leaves
- **Do:** Cast Champion of the Weird, beholding the Gristle Glutton in your hand. Then cast Unsummon on Champion of the Weird.
- **Expect:** When Champion leaves the battlefield, Gristle Glutton returns from exile to your hand.

### Lys Alana Dignitary: behold an Elf from your hand
- **Do:** Cast Lys Alana Dignitary choosing "Behold an Elf" and reveal Llanowar Elves.
- **Expect:** The cast menu offers "Behold an Elf" and "Pay {2}". Llanowar Elves is revealed and stays in your hand.

### Lys Alana Dignitary: Bob sees only the card revealed
- **Do:** Cast Lys Alana Dignitary choosing "Behold an Elf" and reveal Llanowar Elves. Then switch to Bob and look at his view and the log.
- **Expect:** Bob sees Llanowar Elves revealed, and nothing shows him which other cards in your hand could have been chosen.

### Theorist's Sanctum: behold a Jace to enter untapped
- **Do:** Play Theorist's Sanctum and behold Jace Beleren.
- **Expect:** It asks whether to behold a Jace (choosing none is allowed). Beholding Jace Beleren, it enters untapped.

### Theorist's Sanctum: no Jace beheld, enters tapped
- **Do:** Play Theorist's Sanctum and choose none when it asks to behold a Jace.
- **Expect:** It enters tapped.

### Scarlet Spider, Ben Reilly: web-slinging offers only tapped creatures
- **Do:** Click Scarlet Spider in your hand.
- **Expect:** The cast menu offers the normal cast and one "(web-slinging, returning …)" entry for each tapped creature (Hill Giant, Grizzly Bears), never for the untapped Llanowar Elves.

### Scarlet Spider, Ben Reilly: web-slinging gives counters
- **Do:** Cast Scarlet Spider with web-slinging, returning Hill Giant.
- **Expect:** It costs {R}{G}. Hill Giant goes to your hand, and Scarlet Spider enters with four +1/+1 counters (Hill Giant's mana value).

### Scarlet Spider, Ben Reilly: cast normally, no counters
- **Do:** Cast Scarlet Spider normally, for {1}{R}{G}.
- **Expect:** It enters with no +1/+1 counters, and Hill Giant stays on the battlefield.

### Spiders-Man, Heroic Horde: web-slinging gives life and Spiders
- **Do:** Cast Spiders-Man with web-slinging, returning Grizzly Bears.
- **Expect:** It costs {4}{G}{G}. Grizzly Bears goes to your hand, you gain 3 life, and you get two 2/1 green Spider tokens with reach.

### Spiders-Man, Heroic Horde: cast normally, no bonus
- **Do:** Cast Spiders-Man normally, for {1}{G}.
- **Expect:** You gain no life and get no Spider tokens.

### Geyser Leaper: paying waterbend by tapping artifacts and creatures
- **Do:** Activate Geyser Leaper's "Waterbend {4}". Click Ornithopter, Sol Ring, Grizzly Bears and Geyser Leaper itself, then confirm.
- **Expect:** The banner says "waterbend — tap up to N artifacts or creatures to pay {1} each". Your artifacts and creatures light up on the board (not Bob's, not lands), and each click toggles one. The confirm reads "Waterbend n" or "Pay with mana". The four you picked become tapped.

### Water Whip: waterbend {5} with lands and taps
- **Do:** Cast Water Whip on Bob's Hill Giant and Grizzly Bears. Pay {U}{U} from Islands and the waterbend {5} with two Islands plus tapping Ornithopter, Sol Ring and Grizzly Bears.
- **Expect:** The three you picked tap, and the rest is paid from your lands. Water Whip's {U}{U} can't be paid by tapping creatures.

### Airbending Lesson: the owner may cast it from exile for {2}
- **Do:** Cast Airbending Lesson on Bob's Craw Wurm. Open your exile viewer, then switch to Bob and open his.
- **Expect:** Craw Wurm goes to Bob's exile. His exile viewer offers "Cast (airbend)" for {2}. You aren't offered it: it's his card.

### Avatar's Wrath: airbends every creature but the chosen one
- **Do:** Cast Avatar's Wrath, choosing your Grizzly Bears.
- **Expect:** Bob's Hill Giant is exiled; your Grizzly Bears stays. Avatar's Wrath exiles itself.

### Avatar's Wrath: no casting from exile until your next turn
- **Do:** Cast Avatar's Wrath, choosing your Grizzly Bears, and pass the turn. Switch to Bob and open his exile. Then play on through your next turn and look again on Bob's following turn.
- **Expect:** On Bob's first turn he can't cast Hill Giant from exile. After your next turn has begun, he can, for {2}.

### Walking Sarcophagus: start your engines shows speed 1
- **Do:** Before doing anything, look at your panel and Bob's.
- **Expect:** Your panel shows "🏁 1/4" from the start. Bob's shows no speed.

### Gastal Thrillseeker: speed rises only once a turn
- **Do:** Cast Gastal Thrillseeker (it deals 1 damage to Bob). Then attack Bob with Walking Sarcophagus.
- **Expect:** Bob losing life puts a "Speed" ability on the stack, with its text shown, and your speed becomes 2. The combat damage that turn doesn't raise it again.

### Walking Sarcophagus: max speed
- **Do:** Cast Gastal Thrillseeker, then attack Bob with Walking Sarcophagus. On each of your next two turns, attack Bob again.
- **Expect:** Your speed rises to 3 on your next turn and 4 on the one after. At 4 the badge turns bright ("🏁 max"), Walking Sarcophagus is 3/3, and Gastal Thrillseeker has deathtouch and haste.

### Venomsac Lagac: saddle needs total power 2
- **Do:** Open Venomsac Lagac's menu and choose "Saddle 2". Pick Llanowar Elves alone, then switch to Grizzly Bears.
- **Expect:** The picker asks for creatures with total power 2. Llanowar Elves alone isn't enough. The summoning-sick Grizzly Bears may saddle.

### Venomsac Lagac: saddled, it gets +0/+3 attacking
- **Do:** Saddle Venomsac Lagac by tapping Grizzly Bears, then attack Bob with it. Pass to your next turn.
- **Expect:** Venomsac Lagac shows a "Sdl" chip and the log says it becomes saddled. Attacking, it gets +0/+3. The chip is gone on your next turn.

### Venomsac Lagac: no saddling on Bob's turn
- **Do:** It's Bob's turn. When you get priority, open Venomsac Lagac's menu.
- **Expect:** Saddle isn't offered (sorcery speed only).

### Reckoner Bankbuster: what each creature crews for
- **Do:** Choose Reckoner Bankbuster's "Crew 3" and look at what each creature counts for.
- **Expect:** The picker counts Hotshot Mechanic as 4, Giant Ox as 6 and Grizzly Bears as 2. Hotshot Mechanic or Giant Ox alone is enough; Grizzly Bears alone isn't.

### Hotshot Mechanic: crews Crew 3 alone, power still 2
- **Do:** Crew Reckoner Bankbuster with Hotshot Mechanic alone.
- **Expect:** The Bankbuster is crewed. Hotshot Mechanic's own power still shows 2 on its tile.

### Giant Ox: crews with its toughness
- **Do:** Crew Reckoner Bankbuster with Giant Ox alone.
- **Expect:** The Bankbuster is crewed: Giant Ox counts as 6.

### Forgotten Ancient: moving its counters at upkeep
- **Do:** Pass to your turn. At your upkeep, accept Forgotten Ancient's move: pick Grizzly Bears on the board and move 2 counters, then pick Llanowar Elves and move 1.
- **Expect:** The prompt asks for a creature on the board ("none to stop"). A creature already given counters isn't offered again, and the count offered never exceeds what Forgotten Ancient has left. Afterwards Forgotten Ancient is a 0/3 with no counters, Grizzly Bears 4/4, Llanowar Elves 2/2.

### Nesting Grounds: choosing which kind of counter to move
- **Do:** Activate Nesting Grounds targeting Hill Giant, then Grizzly Bears, and choose the flying counter.
- **Expect:** The bottom-right banner asks which kind, with buttons "Move a +1/+1 counter" and "Move a flying counter". Grizzly Bears gains flying and Hill Giant loses it.

### Mirage Mirror: a copy until end of turn
- **Do:** Activate Mirage Mirror targeting Bob's Hill Giant. Pass the turn.
- **Expect:** Mirage Mirror's tile shows Hill Giant, a 3/3 creature you control, for the rest of the turn. After cleanup it's Mirage Mirror again.

### Silent Hallcreeper: a mode can't be chosen twice
- **Do:** Attack Bob with Silent Hallcreeper and choose "Draw a card". On your next turn attack again.
- **Expect:** The second trigger offers only the two modes not chosen yet.

### Silent Hallcreeper: becomes a copy for good
- **Do:** Attack Bob with Silent Hallcreeper and choose the copy mode, targeting Craw Wurm. Pass to your next turn.
- **Expect:** Silent Hallcreeper becomes a Craw Wurm, and is still one on your next turn.

### Haystack: a phased-out creature and its Equipment
- **Do:** Activate Haystack targeting Grizzly Bears (wearing Bonesplitter).
- **Expect:** Grizzly Bears and Bonesplitter stay at your seat, dimmed and greyed, the Equipment still tucked under the Bears. They can't be clicked for anything, and the log reads "phases out".

### Haystack: the creature phases back in on your next turn
- **Do:** Activate Haystack targeting Grizzly Bears (wearing Bonesplitter). Pass to your next turn.
- **Expect:** On your next turn Grizzly Bears phases in, no longer dimmed, with Bonesplitter still attached.

### Oubliette: the creature stays phased out
- **Do:** Cast Oubliette targeting Bob's Craw Wurm. Pass to your next turn.
- **Expect:** Craw Wurm dims at Bob's seat and stays phased out through Bob's turn.

### Oubliette: the creature returns tapped when it leaves
- **Do:** Cast Oubliette targeting Bob's Craw Wurm. Then cast Disenchant on Oubliette.
- **Expect:** When Oubliette leaves, Craw Wurm comes back tapped.

### Teferi's Protection: everything you control phases out
- **Do:** Cast Teferi's Protection. Pass to your next turn.
- **Expect:** Every permanent you control dims, and the log notes your protection. They all phase back in at your next untap step.

### Nylea, God of the Hunt: not a creature below five devotion
- **Do:** Look at Nylea, then go to combat.
- **Expect:** Nylea is a legendary enchantment: no power/toughness box, not a creature, and she can't attack. Your devotion to green is 1.

### Nylea, God of the Hunt: a creature at five devotion
- **Do:** Cast Grizzly Bears, then Leatherback Baloth.
- **Expect:** At five devotion (Nylea's {G}, the Bears' {G} and the Baloth's three) Nylea becomes a 6/6 creature God.

### Nylea, God of the Hunt: trample even while not a creature
- **Do:** Cast Grizzly Bears.
- **Expect:** Grizzly Bears has trample, though Nylea isn't a creature.

### Bolt Bend: changing a spell's single target
- **Do:** Cast Lightning Bolt at Bob's Hill Giant. With it on the stack, cast Bolt Bend at the Bolt. Pass until Bolt Bend resolves and pick a new target.
- **Expect:** Bolt Bend asks "Change the target of Lightning Bolt", with the Hill Giant not offered and no Keep button. The Bolt then hits what you picked.

### Wild Ricochet: new targets, then a copy
- **Do:** Cast Lightning Bolt at Bob's Hill Giant, then Wild Ricochet at the Bolt. Pick targets as asked.
- **Expect:** Wild Ricochet asks "Choose new targets for Lightning Bolt" with a Keep button, then asks the copy's targets. Both Bolts resolve at what you chose.

### Spellskite: redirects a spell without asking
- **Do:** Cast Lightning Bolt at Bob's Grizzly Bears. With it on the stack, activate Spellskite at it, paying 2 life.
- **Expect:** The Bolt moves to Spellskite without asking you anything (it's the only choice).

### Duress: choosing from Bob's whole hand
- **Do:** Cast Duress at Bob and pick a card.
- **Expect:** It shows Bob's whole hand ("Choose a card from Bob's hand for them to discard") with only Lightning Bolt and Counterspell choosable. The one picked goes to Bob's graveyard, the history says Bob discards it, and Bob's hand stays face up for the turn.

### Thoughtseize: any nonland card, and you lose 2
- **Do:** Cast Thoughtseize at Bob and pick Grizzly Bears.
- **Expect:** Grizzly Bears can be taken. It goes to Bob's graveyard and you lose 2 life.

### Oildeep Gearhulk: look at a hand and decline
- **Do:** Cast Oildeep Gearhulk, target Bob as it enters, and decline to choose a card.
- **Expect:** You look at Bob's hand without anything being revealed. Declining leaves his hand as it was, and he draws nothing.

### Overlord of the Mistmoors: cast for impending
- **Do:** Cast Overlord of the Mistmoors, choosing the "(impending)" option.
- **Expect:** The cast offers "(impending)" for {2}{W}{W} beside its full cost. It enters as an enchantment with four time counters shown on it, not as a creature (no power/toughness, not among your creatures). It makes two 2/1 flying Insects, and Soul Warden gains you 2 life, not 3.

### Overlord of the Boilerbilges: impending, and 4 damage
- **Do:** Cast Overlord of the Boilerbilges for its impending cost and target Bob.
- **Expect:** The cast offers "(impending)" for {2}{R}{R}. It enters as an enchantment with four time counters, not as a creature, and deals 4 damage to Bob.

### Overlord of the Mistmoors: loses a time counter at your end step
- **Do:** Cast Overlord of the Mistmoors for impending. Pass to your end step.
- **Expect:** At your end step it loses one time counter (three left), and the log says so.

### Overlord of the Mistmoors: Impending reminder on hover
- **Do:** Hover "Impending" in Overlord of the Mistmoors' card text.
- **Expect:** Its reminder text shows.

### Heartfire Hero: valiant only the first time each turn
- **Do:** Cast Giant Growth on Heartfire Hero, then the second Giant Growth on it.
- **Expect:** The first Giant Growth puts a +1/+1 counter on Heartfire Hero; the second doesn't.

### Eagle Vision: freerunning after an Assassin's combat damage
- **Do:** Look at Eagle Vision in your hand. Attack Bob with Agate-Blade Assassin and let it deal damage. In your postcombat main, cast Eagle Vision.
- **Expect:** Before combat it offers only its full cost ({4}{U}, more than you have). After the Assassin dealt combat damage to Bob it offers "(freerunning)" for {1}{U}, and you draw three.

### Eagle Vision: Freerunning reminder on hover
- **Do:** Hover "Freerunning" in Eagle Vision's card text.
- **Expect:** Its reminder text shows.

### Treetop Sentries: forage by exiling three cards
- **Do:** Cast Treetop Sentries. When asked whether to forage, choose to exile three cards from your graveyard and pick them.
- **Expect:** It offers both ways to forage: exile three cards from your graveyard (you pick which) or sacrifice the Food. The three cards are exiled and you draw a card.

### Treetop Sentries: forage by sacrificing a Food
- **Do:** Cast Treetop Sentries. When asked whether to forage, choose to sacrifice the Food.
- **Expect:** The Food is sacrificed and you draw a card.

### Treetop Sentries: declining to forage draws nothing
- **Do:** Cast Treetop Sentries. When asked whether to forage, decline.
- **Expect:** You draw nothing.

### Treetop Sentries: forage reminder on hover
- **Do:** Hover "forage" in Treetop Sentries' card text.
- **Expect:** Its reminder text shows.

### Depth Defiler: kicked, its cast trigger takes both modes
- **Do:** Cast Depth Defiler paying its kicker {C} (all six lands).
- **Expect:** The cast trigger demands both modes: return Bob's Grizzly Bears, and a player draws two then discards one.

### Depth Defiler: unkicked, exactly one mode
- **Do:** Cast Depth Defiler without kicker.
- **Expect:** The cast trigger offers exactly one mode.

### Silverquill Lecturer: demonstrate copies for you and Bob
- **Do:** Cast Depth Defiler with its kicker {C}. Choose both modes (return Grizzly Bears; Bob draws two then discards one). For demonstrate, copy it and choose Bob to copy it too.
- **Expect:** Two copies are made. Bob's resolves first and becomes a Depth Defiler token Bob controls, then yours, then the original: three Defilers in all. Neither copy has a cast trigger of its own.

### The One Ring: you can't be targeted until your next turn
- **Do:** Cast The One Ring and pass the turn. Switch to Bob and start casting Lightning Bolt.
- **Expect:** Lightning Bolt doesn't offer you as a target.

### The One Ring: damage to you is prevented
- **Do:** Cast The One Ring and pass the turn. Switch to Bob and attack you with Grizzly Bears.
- **Expect:** The damage to you is prevented; your life doesn't change.

### The Wandering Emperor: instant speed on the turn she enters
- **Do:** Pass the turn. When Bob attacks with Grizzly Bears, cast The Wandering Emperor during his combat and use her −2 on the tapped Bears. Then open her menu again.
- **Expect:** She activates at instant speed, once: after the −2 she offers no other loyalty ability that turn.

### The Wandering Emperor: back to sorcery speed on your turn
- **Do:** Pass the turn. During Bob's turn, cast The Wandering Emperor (flash). In your next upkeep, open her menu.
- **Expect:** In your upkeep her loyalty abilities aren't offered: on your own turn she's back to sorcery speed.

### The One Ring: burden counters draw, then cost life
- **Do:** Tap The One Ring. Pass to your next turn.
- **Expect:** Tapping it puts a burden counter on it and draws you that many cards (one). In your next upkeep you lose 1 life per burden counter.

## Plot and crimes (2026-10-16)

### Aloe Alchemist: Plot only in your main phase
- **Do:** Look at Aloe Alchemist in your hand in your main phase. Then go to combat and look again.
- **Expect:** In your main phase with the stack empty, it has a **Plot** button showing its plot cost, {1}{G}. In combat there's no Plot button.

### Aloe Alchemist: plotting it triggers
- **Do:** Use Aloe Alchemist's **Plot** button and target your Grizzly Bears with its trigger.
- **Expect:** The card sits on your board after your permanents, faded and badged **Plotted** (the exile viewer badges it too). Its trigger asks for a target, the log says it became plotted, and Grizzly Bears is 5/4 this turn.

### Longhorn Sharpshooter: plotting it deals 2 damage
- **Do:** Use Longhorn Sharpshooter's **Plot** button ({3}{R}) and point its 2 damage at Bob.
- **Expect:** Bob's life drops from 20 to 18. Longhorn Sharpshooter sits on your board, faded and badged **Plotted**.

### Aloe Alchemist: Bob sees the plotted card
- **Do:** Plot Aloe Alchemist, targeting your Grizzly Bears. Switch to Bob.
- **Expect:** Bob also sees Aloe Alchemist on your board, badged **Plotted**.

### Aloe Alchemist: not castable from plot the same turn
- **Do:** Plot Aloe Alchemist, targeting your Grizzly Bears. Try to cast it from exile this turn, then again on Bob's turn.
- **Expect:** It can't be cast, either that turn or on Bob's turn.

### Aloe Alchemist: cast free from plot on a later turn
- **Do:** Plot Aloe Alchemist, targeting your Grizzly Bears. Pass to your next turn and click the plotted tile in your main phase.
- **Expect:** On your next turn the plotted tile lights up in your main phase, and a click casts it without paying its mana cost.

### Slickshot Vault-Buster: targeting yourself isn't a crime
- **Do:** Cast Lightning Bolt at yourself.
- **Expect:** Slickshot Vault-Buster stays 1/4.

### Slickshot Vault-Buster: targeting an opponent's creature is a crime
- **Do:** Cast Lightning Bolt at Bob's Grizzly Bears. Pass to Bob's turn.
- **Expect:** Slickshot Vault-Buster is 3/4 for the rest of your turn, and back to 1/4 on Bob's turn.

### Patrolling Peacemaker: your own crime doesn't trigger it
- **Do:** Cast Lightning Bolt at Bob's Grizzly Bears.
- **Expect:** Patrolling Peacemaker doesn't trigger; it keeps two +1/+1 counters.

### Patrolling Peacemaker: one opponent's crime against another
- **Do:** Pass to Bob's turn. Switch to Bob and cast Lightning Bolt at Carol.
- **Expect:** Bob's Bolt at Carol triggers Patrolling Peacemaker, which proliferates it to a third +1/+1 counter.

## Rad counters, squad, collect evidence and Cases (2026-10-16)

### Powder Ganger: one squad cast per number of payments
- **Do:** Click Powder Ganger in your hand.
- **Expect:** The cast menu offers Powder Ganger plain, squad ×1 and squad ×2, labelled as squad.

### Powder Ganger: squad twice makes two copies
- **Do:** Cast Powder Ganger paying squad twice ({2}{R} + {2} + {2}). Destroy Bob's Mind Stone with one of the enters triggers.
- **Expect:** Two token copies arrive, each with its own enters trigger. Mind Stone is destroyed.

### Contaminated Drink: rad counters mill at your precombat main
- **Do:** Cast Contaminated Drink with X = 3. Pass to your next turn's precombat main.
- **Expect:** After the Drink your panel shows ☢ 2. At your next precombat main the Rad Counters trigger mills two cards (Grizzly Bears and Hill Giant). For each nonland card milled you lose 1 life and a rad counter, and the log says so.

### Crimestopper Sprite: collect evidence needs a total of 6
- **Do:** Cast Crimestopper Sprite collecting evidence, picking cards from your graveyard, and target Bob's Grizzly Bears.
- **Expect:** Confirm is enabled only once your picks total mana value 6 or more. Bob's Grizzly Bears is tapped and gets a stun counter.

### Crimestopper Sprite: no collecting cast below 6
- **Do:** Click Crimestopper Sprite in your hand (your graveyard totals only 4).
- **Expect:** Only the plain cast is offered, not the collect-evidence one.

### Surveillance Monitor: declining collect evidence makes no Thopter
- **Do:** Cast Surveillance Monitor and decline its collect evidence.
- **Expect:** No Thopter is made.

### Surveillance Monitor: collecting evidence makes a Thopter
- **Do:** Cast Surveillance Monitor and collect evidence 4 from your graveyard.
- **Expect:** You get a 1/1 colorless flying Thopter token.

### Case of the Crimson Pulse: solved with an empty hand
- **Do:** With no cards in hand, pass to your end step, then on to your next upkeep.
- **Expect:** At your end step the Case shows a **solved** chip. From then on its upkeep trigger works: at your next upkeep it triggers.

## Explore, Map tokens, discover and craft (2026-10-16)

### Cenote Scout: exploring a nonland card
- **Do:** Cast Cenote Scout and keep Hill Giant on top of your library.
- **Expect:** Hill Giant is revealed to everyone, Cenote Scout gets a +1/+1 counter, and you're asked once whether to put the card into your graveyard.

### Spyglass Siren: a Map token makes your creature explore
- **Do:** Cast Spyglass Siren. Activate its Map token targeting Cenote Scout, and put the Hill Giant into your graveyard.
- **Expect:** The Map targets only a creature you control. Hill Giant is revealed and goes to your graveyard, and Cenote Scout gets a +1/+1 counter.

### Map Token: only at sorcery speed
- **Do:** Open the Map token's menu in your main phase. Then go to combat and open it again.
- **Expect:** The Map's ability is offered in your main phase but not during combat.

### Map Token: needs a creature you control
- **Do:** Open the Map token's menu (you control no creature; Bob has Grizzly Bears).
- **Expect:** You can't crack the Map: it needs a creature you control to target.

### Merfolk Cave-Diver: exploring makes it unblockable
- **Do:** Cast Cenote Scout and let it explore.
- **Expect:** Merfolk Cave-Diver gets +1/+0 and can't be blocked this turn.

### Geological Appraiser: discover offers a free cast
- **Do:** Cast Geological Appraiser. Cast the discovered card for free.
- **Expect:** Discover exiles the Forest and finds Grizzly Bears, offered as a free cast. The Forest ends on the bottom of your library.

### Curator of Sun's Creation: discover again, declined to hand
- **Do:** Cast Geological Appraiser. Cast the first discovered card free; decline the second.
- **Expect:** The first discover finds Grizzly Bears. Curator's trigger then discovers 3 again, skipping Hill Giant (mana value 4) and offering Llanowar Elves, which goes to your hand when declined. The Forest and Hill Giant end on the bottom of your library.

### Curator of Sun's Creation: only once each turn
- **Do:** Cast Geological Appraiser and let both discovers finish. Then cast a second Geological Appraiser.
- **Expect:** The second Appraiser's discover happens once: Curator doesn't make it discover again.

### Oteclan Landmark: crafting with a graveyard artifact
- **Do:** Activate Oteclan Landmark's craft ability and pick Ornithopter from your graveyard.
- **Expect:** The choice shows your Treasures and the graveyard's Ornithopter together, and takes exactly one. The Landmark comes back as Oteclan Levitator, a 1/4 flyer, and Ornithopter is in exile.

### Oteclan Landmark: crafting with a Treasure
- **Do:** Activate Oteclan Landmark's craft ability and pick one Treasure.
- **Expect:** The Landmark comes back as Oteclan Levitator, the chosen Treasure is exiled, and the other Treasure stays.

### Oteclan Landmark: craft only in a main phase
- **Do:** Open Oteclan Landmark's menu in your main phase, then go to combat and open it again.
- **Expect:** The craft ability is offered in your main phase with the stack empty, and not during combat.

## Top-500 commanders: Sauron, Hakbal, Ezio and others (2026-10-16)

### Hakbal of the Surging Soul: choosing the explore order
- **Do:** Go to combat. Pick the order the Merfolk explore in, and put both revealed cards into your graveyard.
- **Expect:** The order choice names Hakbal and Cenote Scout, and each gets a +1/+1 counter.

### Hakbal of the Surging Soul: a land onto the battlefield on attack
- **Do:** Go to combat (let the explore finish), then attack Bob with Hakbal. Put the Forest onto the battlefield.
- **Expect:** Hakbal's attack trigger offers the Forest from your hand, and it enters the battlefield.

### Hakbal of the Surging Soul: no land put down, draw instead
- **Do:** Go to combat (let the explore finish), then attack Bob with Hakbal. Decline to put the Forest onto the battlefield.
- **Expect:** You draw a card instead.

### Ezio Auditore da Firenze: pay {W}{U}{B}{R}{G} to win
- **Do:** Attack Bob (at 13 life) with Ezio. When Ezio deals damage, pay {W}{U}{B}{R}{G}.
- **Expect:** Ezio's damage takes Bob to 10, and you're offered the {W}{U}{B}{R}{G} payment. Paying, Bob loses the game.

### Ezio Auditore da Firenze: Assassin spells gain freerunning
- **Do:** Attack Bob with Ezio and let it deal damage. In your postcombat main, click Boilerbilges Ripper in your hand.
- **Expect:** Boilerbilges Ripper offers a freerunning cast for {B}{B}.

## Cast by discarding a card (2026-10-16)

### The Infamous Cruelclaw: casting by discarding a card
- **Do:** Attack Bob with The Infamous Cruelclaw (no blocks). Cast Hill Giant from the offer, and discard Llanowar Elves.
- **Expect:** Wastes and Hill Giant are exiled first. The offer reads "by discarding a card rather than paying its mana cost" with a "(discard a card)" button. The discard asks for one card. Hill Giant resolves onto your battlefield, and Grizzly Bears stays in your hand.

## Sacrifice any number as a cost (2026-10-16)

### Dargo, the Shipwrecker: choosing how many to sacrifice
- **Do:** Cast Dargo. Try 1, then 2, then confirm 2; choose Grizzly Bears and Ornithopter.
- **Expect:** The prompt says "how many to sacrifice" (not "choose X"), from 2 to 3. With 2 the cost is {2}{R}, the sacrifice choice asks for exactly two, and Dargo resolves. Grizzly Bears and Ornithopter are in your graveyard.

## Attach extensions (2026-10-16)

### Ardenn, Intrepid Archaeologist: target any permanent or player
- **Do:** Go to combat and look at what Ardenn's trigger can target.
- **Expect:** It offers every permanent and every player, you included.

### Ardenn, Intrepid Archaeologist: a Curse moves, Equipment doesn't
- **Do:** Cast Curse of Verbosity on Bob. Go to combat, target Carol with Ardenn's trigger, and choose the Curse, Bonesplitter and Rancor.
- **Expect:** The choice lists all three. The Curse moves to Carol, while Bonesplitter and Rancor stay on Llanowar Elves (they can't attach to a player).

### Ardenn, Intrepid Archaeologist: moving Equipment to a creature
- **Do:** Go to combat, target Grizzly Bears with Ardenn's trigger, and choose Bonesplitter.
- **Expect:** Bonesplitter moves to Grizzly Bears; Rancor stays on Llanowar Elves.

## Live-game rules fixes (2026-10-16)

### Archfiend of Depravity: keeping two creatures
- **Do:** Pass to your end step. When asked, choose two creatures to keep.
- **Expect:** You're asked to choose up to 2 to keep, the rest sacrificed, strongest listed first. Exactly the two unchosen ones go to your graveyard.

### Archfiend of Depravity: keeping none
- **Do:** Pass to your end step. When asked, choose no creatures and confirm.
- **Expect:** Confirm works with none chosen, and all four creatures go to your graveyard.

## Doctor Who: time travel (2026-10-17)

### Wibbly-wobbly, Timey-wimey: only your time counters are offered
- **Do:** Suspend Rift Bolt (it gets one time counter), then cast Wibbly-wobbly, Timey-wimey.
- **Expect:** The board marks your Four Knocks and Rotating Fireplace, but not Bob's Four Knocks. The bar has a row for the suspended Rift Bolt only.

### Wibbly-wobbly, Timey-wimey: adding and removing counters
- **Do:** Cast Wibbly-wobbly, Timey-wimey. With the brush on "Add a counter", click Rotating Fireplace; switch to "Remove a counter", click Four Knocks, and Confirm.
- **Expect:** Rotating Fireplace has 2 time counters and Four Knocks has 1.

### Wibbly-wobbly, Timey-wimey: a suspended card's last counter
- **Do:** Suspend Rift Bolt, then cast Wibbly-wobbly, Timey-wimey. Set Rift Bolt's row to −1 and Confirm.
- **Expect:** Once the draw is done, you're offered Rift Bolt's free cast.

### Wibbly-wobbly, Timey-wimey: Clear, and Confirm with nothing picked
- **Do:** Cast Wibbly-wobbly, Timey-wimey. Click Rotating Fireplace with "Add a counter", then click Clear, then Confirm with nothing picked.
- **Expect:** Clear unpicks the Fireplace. Confirm works with nothing picked, and the Fireplace keeps its one time counter.

### Trap the Trespassers: a secret vote, revealed all at once
- **Do:** Cast Trap the Trespassers. Vote for Serra Angel on the board, and let Bob vote.
- **Expect:** You pick your vote on the board, and only Bob's creatures are offered. The log shows no vote until a single "votes revealed" line lists both. Each creature voted for then has that many stun counters and is tapped.

### Plea for Power: Tivit gives you a second vote
- **Do:** Cast Plea for Power. Vote "time", then take Tivit's additional vote and vote "knowledge".
- **Expect:** You're asked twice, the second time with a way to decline. Each vote shows in the log as it's cast.

### Plea for Power: more votes for time gives an extra turn
- **Do:** Cast Plea for Power. Vote "time", and vote "time" again with Tivit's additional vote.
- **Expect:** Time gets more votes, and an extra turn is queued for you after this one.

### Plea for Power: a tie draws three cards
- **Do:** Cast Plea for Power and vote "time". Switch to Bob and vote "knowledge".
- **Expect:** The vote is tied, and you draw three cards.

### Misleading Motes: the owner picks top or bottom
- **Do:** Cast Misleading Motes on Bob's Grizzly Bears. Switch to Bob and pick either answer.
- **Expect:** Bob is asked "Put it on top of your library" / "Put it on the bottom of your library"; you aren't. The Bears go where Bob picked.

### Armament Dragon: dividing +1/+1 counters
- **Do:** Cast Armament Dragon, target your Grizzly Bears and Llanowar Elves, and split the three counters 2/1.
- **Expect:** The bar says "Divide 3 +1/+1 counters", not damage, and each target needs at least one. The Bears get two counters and the Elves one.

### Invasion of Lorwyn: choosing the protector, four players
- **Do:** Cast Invasion of Lorwyn.
- **Expect:** The protector prompt says "choose its protector" and lists your three opponents by name. The battle then shows "🛡 <name>" for the one you picked, and 5 defense counters.

### Invasion of Lorwyn: no protector prompt with one opponent
- **Do:** Cast Invasion of Lorwyn.
- **Expect:** You aren't asked to choose a protector: Bob, the only opponent, protects it, and the battle shows "🛡" with his name.

### Invasion of Lorwyn: attacking the battle, four players
- **Do:** Cast Invasion of Lorwyn, choose Carol as its protector, and destroy Bob's Grizzly Bears with its enters ability. Attack with Craw Wurm.
- **Expect:** The battle is one of Craw Wurm's attack targets. Only its protector (Carol) may block it.

### Invasion of Lorwyn: defeating it casts Winnowing Forces
- **Do:** Cast Invasion of Lorwyn and destroy Bob's Grizzly Bears with its enters ability. Attack the battle with Craw Wurm, then take the free cast.
- **Expect:** The Wurm's 6 damage removes all five defense counters, and the Siege's trigger exiles it and offers the cast. Winnowing Forces enters as a 6/6 (one per land you control).

### Converter Beast: the Incubator token transforms
- **Do:** Cast Converter Beast. Activate the Incubator token's {2} ability.
- **Expect:** The Incubator shows its art and five +1/+1 counters, and isn't a creature until transformed. After the {2} it's a 5/5 Phyrexian artifact creature with the back face's art.

## The initiative and Undercity (2026-10-19)

### Aarakocra Sneak: taking the initiative
- **Do:** Cast Aarakocra Sneak; let its trigger and Secret Entrance resolve (take a basic land). Click your panel's dungeon button.
- **Expect:** The 🗝️ chip sits on your panel, and the log reads "takes the initiative". The room ability shows on the stack as Undercity's, with the room's own text. The dungeon button reads "Undercity 1/5" and opens the map, with the marker on the current room.

### Aarakocra Sneak: your upkeep ventures again, to a fork
- **Do:** Cast Aarakocra Sneak; let its trigger and Secret Entrance resolve. Pass the turn to your next upkeep.
- **Expect:** With the initiative, your upkeep ventures again. The map opens beside the banner "Venture into Undercity: choose the next room", with Forge and Lost Well outlined and clickable.

### Aarakocra Sneak: View board hides the dungeon map
- **Do:** Cast Aarakocra Sneak, let it resolve, and pass to your next upkeep. At the fork, click "View board", then "Show choices".
- **Expect:** "View board" hides the map, and "Show choices" brings it back.

### Aarakocra Sneak: choosing Forge at the fork
- **Do:** Cast Aarakocra Sneak, let it resolve, and pass to your next upkeep. At the fork choose Forge, targeting the Sneak.
- **Expect:** The log reads "ventures into Forge (Undercity)", and your dungeon button reads "Undercity 2/5".

### Aarakocra Sneak: the initiative passes to a player who hits you
- **Do:** Cast Aarakocra Sneak, let it resolve, and pass the turn. Switch to Bob and attack you with the Grizzly Bears; don't block.
- **Expect:** After the Bears' damage the 🗝️ chip moves to Bob's panel, and his dungeon button reads "Undercity 1/5".

### Aarakocra Sneak: taking the initiative back
- **Do:** Cast Aarakocra Sneak and let it resolve. As Bob, attack you with the Grizzly Bears (don't block) and pass Bob's turn. As yourself, attack Bob with the Sneak.
- **Expect:** When the Sneak hits, the 🗝️ chip moves back to your panel and you venture into Undercity again.

## Reconfigure (2026-10-19)

### Bronzeplate Boar: reconfigure attaches it to a creature
- **Do:** Activate the Boar's first "Reconfigure {5}" targeting Grizzly Bears.
- **Expect:** The Boar isn't offered as its own target. Once attached, it draws under the Bears as an attachment (no P/T, no Boar type, still an artifact Equipment), and the Bears are 5/4 with trample.

### Bronzeplate Boar: reconfigure again to unattach
- **Do:** Activate the Boar's first "Reconfigure {5}" targeting Grizzly Bears. Then activate its second "Reconfigure {5}".
- **Expect:** The Boar is a 3/2 creature again, untapped.

### Acquisition Octopus: attacks as a creature and draws
- **Do:** Attack Bob with Acquisition Octopus.
- **Expect:** It attacks as a 2/2, and you draw a card when it hits.

## Cleave (2026-10-19)

### Alchemist's Retrieval: the normal cast targets only your permanents
- **Do:** Click Alchemist's Retrieval and pick "Cast Alchemist's Retrieval".
- **Expect:** The menu offers "Cast Alchemist's Retrieval" and "… (cleave {1}{U})". The normal cast offers only your own nonland permanents (Memnite and Grizzly Bears), not the Hill Giant.

### Alchemist's Retrieval: cleave can return any nonland permanent
- **Do:** Cast Alchemist's Retrieval for its cleave cost, targeting Bob's Hill Giant.
- **Expect:** Any nonland permanent can be targeted. It costs {1}{U}, and the Giant goes to its owner's hand.

### Lantern Flare: cleave asks for X
- **Do:** Cast Lantern Flare for its cleave cost with X = 3, targeting Bob's Hill Giant.
- **Expect:** You're asked for X. It deals 3 damage to the Giant and you gain 3 life.

### Lantern Flare: the normal cast counts your creatures
- **Do:** Cast Lantern Flare normally, targeting Bob's Hill Giant.
- **Expect:** You aren't asked for X. It deals 2 damage and you gain 2 life (your two creatures).

## Engine-gap fixes (2026-10-20)

### Devoted Druid: Solemnity stops its untap ability
- **Do:** Tap Devoted Druid for {G}, then look at its second ability.
- **Expect:** "Put a -1/-1 counter on this creature: Untap this creature" isn't offered, because its cost can't be paid.

### Kitchen Finks: Solemnity lets it persist again and again
- **Do:** Cast Murder on Kitchen Finks. Once it's back, cast the second Murder on it.
- **Expect:** It persists back with no -1/-1 counter, so it persists back again after the second Murder.

### Blighted Agent: Solemnity stops poison counters
- **Do:** Attack Bob with Blighted Agent.
- **Expect:** Its infect damage gives Bob no poison counters and takes no life.

### Grafted Exoskeleton: the equipped creature gets +2/+2 and infect
- **Do:** Equip Grafted Exoskeleton to Grizzly Bears ({2}).
- **Expect:** The Bears are a 4/4 with infect.

### Grafted Exoskeleton: moving it sacrifices the old creature
- **Do:** Equip Grafted Exoskeleton to Grizzly Bears ({2}), then equip it to Hill Giant ({2}).
- **Expect:** As it moves, its trigger goes on the stack naming the Bears, and as it resolves the Bears are sacrificed. The Giant is a 5/5 with infect.

## The Forgotten Realms dungeons (2026-10-20)

### Secret Door: choosing which dungeon to venture into
- **Do:** Activate Secret Door ({4}{U}).
- **Expect:** A popup shows the three dungeons side by side as small maps, each a button, and no Undercity.

### Secret Door: Tomb of Annihilation's Trapped Entry
- **Do:** Activate Secret Door, choose Tomb of Annihilation, and let Trapped Entry resolve.
- **Expect:** Each player loses 1 life.

### Secret Door: the Tomb's fork on the map
- **Do:** Activate Secret Door, choose Tomb of Annihilation, and let Trapped Entry resolve. Activate it again.
- **Expect:** The Tomb's map opens with Veils of Fear and Oubliette outlined.

### Secret Door: Veils of Fear discards stay hidden until all choose
- **Do:** Venture twice with Secret Door into Tomb of Annihilation and choose Veils of Fear at the fork. Discard Hill Giant; then switch to Bob and discard Shock.
- **Expect:** While Bob chooses, Hill Giant is still in your hand and Bob's view doesn't show it discarded. Once he has chosen, both cards reach the graveyards together and nobody loses 2 life.

### Secret Door: the dungeon chip shows progress
- **Do:** Venture twice with Secret Door into Tomb of Annihilation, choose Veils of Fear at the fork, and discard Hill Giant. Click your panel's dungeon chip.
- **Expect:** The chip reads "Tomb of Annihilation 2/4" and opens the Tomb's map.

## Madness (2026-10-20)

### Kitchen Imp: cast for its madness cost
- **Do:** Activate Hell Mongrel's "Discard a card" and discard Kitchen Imp. As the madness trigger resolves, cast the Imp.
- **Expect:** The Imp goes to exile, not the graveyard, and a "Madness" trigger goes on the stack. The banner reads "Cast Kitchen Imp for its madness cost, {B}?" with the button "Cast Kitchen Imp (madness {B})". The Imp costs one Swamp and comes in with haste.

### Terminal Agony: declining a madness cast
- **Do:** Activate Hell Mongrel's "Discard a card" and discard Terminal Agony. Decline its cast.
- **Expect:** It goes to exile with a "Madness" trigger, and once declined it goes to your graveyard.

### Hell Mongrel: +1/+1 for each discard
- **Do:** Activate Hell Mongrel's "Discard a card" twice, discarding Grizzly Bears and Hill Giant.
- **Expect:** The Mongrel is 6/5.

## Mutate (2026-10-20)

### Glowstone Recluse: the mutate cast and its targets
- **Do:** Click Glowstone Recluse and pick its mutate cast.
- **Expect:** The cast button reads "(mutate {3}{G})" and asks for a target. Bob's Hill Giant isn't offered.

### Glowstone Recluse: mutating on top
- **Do:** Cast Glowstone Recluse for its mutate cost targeting Grizzly Bears. As it resolves, pick "Put it on top of the creature".
- **Expect:** The choice reads "Put it on top of the creature" / "Put it under the creature". The permanent shows Glowstone Recluse's card, 4/5 with two +1/+1 counters and reach. It stays untapped and can attack this turn (it isn't new).

### Dreamtail Heron: mutating underneath
- **Do:** Mutate Glowstone Recluse onto Grizzly Bears, on top. Then cast Dreamtail Heron for its mutate cost onto the same creature and put it underneath.
- **Expect:** It's still Glowstone Recluse, now with flying too; you draw a card and two more +1/+1 counters arrive. Its text shows all three cards' abilities.

### Dreamtail Heron: a mutated creature dies as all its cards
- **Do:** Mutate Glowstone Recluse onto Grizzly Bears (on top), then Dreamtail Heron underneath. Cast Murder on it.
- **Expect:** Grizzly Bears, Glowstone Recluse and Dreamtail Heron all go to your graveyard.

## Pitch costs (2026-10-21)

### Force of Will: cast by exiling a blue card
- **Do:** Cast Grizzly Bears, then — holding priority — cast Force of Will for its alternative cost targeting the Bears, and exile Counterspell.
- **Expect:** Force of Will's second button reads "(pay 1 life, exile a blue card from your hand)". The choice reads "Choose a card to exile" and offers only Opt and Counterspell (never Force of Will itself, never the Bears). No land taps, you lose 1 life, and the Bears are countered.

### Solitude: evoke by exiling a white card
- **Do:** Cast Solitude for its evoke cost, and target Bob's Hill Giant with its enters trigger.
- **Expect:** The button reads "(evoke: exile a white card from your hand)", and Swords to Plowshares, the only white card, is exiled without asking. The Giant is exiled and its controller gains 3 life, and Solitude is sacrificed.

### Dusk Charger: the city's blessing at ten permanents
- **Do:** Play the Island from your hand.
- **Expect:** Your player panel shows a 🏛️ badge ("The city's blessing…" on hover) at once, and the log says you get the city's blessing. Dusk Charger shows 5/5.

### Secrets of the Golden City: ascend as it resolves
- **Do:** Cast Secrets of the Golden City (you control ten Islands).
- **Expect:** You get the city's blessing (the 🏛️ badge) and draw three cards, not two.

### Dusk Charger: the city's blessing stays when lands leave
- **Do:** Play the Island from your hand (you now control ten permanents). Then use Strip Mine to destroy one of your Islands.
- **Expect:** The 🏛️ badge stays on your panel after the Strip Mine and the Island leave.

### Circle of Protection: Red: a spell on the stack as the source
- **Do:** Cast Lightning Bolt targeting yourself and, holding priority, activate the Circle. When asked to choose a source, click the Bolt on the stack.
- **Expect:** The prompt reads "Choose a source of damage"; the Bolt on the stack and Bob's Raging Goblin are highlighted to pick, while the Circle and your lands are not. The log says the next damage Lightning Bolt would deal to you will be prevented, and your life doesn't change.

### Circle of Protection: Red: the chosen source turns blue
- **Do:** Activate the Circle, choosing Bob's Raging Goblin. Then cast Thoughtlace on the Goblin.
- **Expect:** The Goblin becomes blue: the log says so, and the card shows blue.

### Ashnod's Battle Gear: asked in your untap step
- **Do:** Activate the Gear targeting Hill Giant (it shows 5/1). Pass the turn and come back to your untap step.
- **Expect:** The question comes in your untap step only, not the opponent's. It reads "Choose permanents to leave tapped" and offers only the Gear.

### Ashnod's Battle Gear: left tapped, the bonus stays
- **Do:** Activate the Gear targeting Hill Giant. Pass the turn; in your untap step, pick the Gear to leave it tapped.
- **Expect:** The Gear stays tapped and the Giant stays 5/1.

### Ashnod's Battle Gear: untapped, the bonus ends
- **Do:** Activate the Gear targeting Hill Giant. Pass the turn; in your untap step, confirm with nothing picked.
- **Expect:** The question can be confirmed with nothing picked. The Gear untaps and the Giant goes back to 3/3 at once.

### Bottomless Vault: remove any number of storage counters for mana
- **Do:** Tap Bottomless Vault for mana by hand and choose X = 2, then cast Hymn to Tourach.
- **Expect:** The X picker offers 0 to 3. X = 2 adds exactly {B}{B} and leaves one storage counter.

### Bottomless Vault: X = 0 taps for nothing
- **Do:** Tap Bottomless Vault for mana by hand and choose X = 0.
- **Expect:** It taps, adds no mana, and keeps all three storage counters.

### Farrel's Zealot: unblocked, it deals 3 to a creature instead
- **Do:** Attack with Farrel's Zealot (Bob's Craw Wurm is tapped). Accept the Zealot's offer, targeting the Wurm.
- **Expect:** The Wurm takes 3 damage, and the Zealot deals Bob no combat damage.

### Farrel's Zealot: declining, it hits for 2
- **Do:** Attack with Farrel's Zealot (Bob's Craw Wurm is tapped). Decline the Zealot's offer.
- **Expect:** The Zealot hits Bob for 2.

### Necrite: a blocked attacker doesn't trigger
- **Do:** Attack with Farrel's Zealot and Necrite. Switch to Bob and block Necrite with Craw Wurm, leaving the Zealot unblocked.
- **Expect:** Only the Zealot's ability triggers; Necrite's doesn't, because it was blocked.

### Illusionary Wall: paying cumulative upkeep
- **Do:** Pass the turn and come back to your upkeep. When asked, pay.
- **Expect:** The prompt asks for {U}{U} (two age counters) and offers paying or not. Paid, the Wall stays, with two age counters.

### Illusionary Wall: declining cumulative upkeep
- **Do:** Pass the turn and come back to your upkeep (the Wall has two age counters). When asked, decline.
- **Expect:** The prompt asks for {U}{U}{U}. Declined, the Wall is sacrificed.

### Dark Depths: the last ice counter triggers once
- **Do:** Activate Dark Depths' {3} ability.
- **Expect:** As the last counter goes, one trigger goes on the stack (not one per priority pass). It resolves to sacrifice Dark Depths and make one Marit Lage, a 20/20 flying indestructible Avatar.

### Vindictive Lich: each mode at a different opponent
- **Do:** Cast Murder on your own Vindictive Lich. Choose the sacrifice mode and the lose-5-life mode, each at a different opponent.
- **Expect:** You're offered at most two modes (one per opponent) and can't aim two modes at one player. One opponent sacrifices their creature, the other loses 5 life, and nobody discards.

### Conqueror's Galleon: attacks and comes back a land
- **Do:** Crew 4 with Craw Wurm, attack with the Galleon, and let combat end.
- **Expect:** At end of combat the Galleon is exiled and returns as Conqueror's Foothold, an untapped land under your control with its four abilities.

### Consign // Oblivion: only Consign casts from your hand
- **Do:** Click Consign // Oblivion in your hand, and cast Consign on Bob's Grizzly Bears.
- **Expect:** From your hand only Consign can be cast.

### Consign // Oblivion: Oblivion casts from the graveyard, then exiles
- **Do:** Open your graveyard and cast Oblivion at Bob.
- **Expect:** From the graveyard only Oblivion can be cast, labelled aftermath. Bob discards two cards, and Consign // Oblivion ends in exile, not the graveyard.

### Chance: discard two, draw two
- **Do:** Cast Chance from your graveyard. When asked, pick two cards and confirm.
- **Expect:** The bar reads "Discard any number of cards", and its button works with none, one, two or three picked. You discard two and draw two.

### Chance: discard none, draw none
- **Do:** Cast Chance from your graveyard. When asked, confirm with nothing picked.
- **Expect:** The button works with nothing picked, and you draw no cards.

### Reverse Engineer: improvise with artifacts
- **Do:** Cast Reverse Engineer. When the bar asks, tap the three artifacts, then pay the rest.
- **Expect:** The bar reads "improvise — tap up to 3 artifacts" and only the artifacts can be picked (not Grizzly Bears). With all three tapped, the two Islands pay {U}{U}, and you draw three cards.

## Engine rules gaps closed (2026-10-24)

### Lethal Sting: can't be cast while Melira protects your creatures
- **Do:** Click Lethal Sting in your hand.
- **Expect:** It can't be cast: Melira, Sylvok Outcast stops -1/-1 counters on your creatures, so its extra cost can't be paid, though you have Grizzly Bears and the mana.

### Nissa's Encouragement: may find nothing, though a Forest is in your graveyard
- **Do:** Cast Nissa's Encouragement. When asked, confirm with nothing picked.
- **Expect:** The Forest in your graveyard and the Brambleweft Behemoth in your library are offered, and the button works with nothing picked. The Forest stays in your graveyard.

### Chandra, Fire Artisan: two attackers at once make one trigger
- **Do:** Attack Bob's Chandra, Fire Artisan with both Grizzly Bears. Don't block (as Bob, if asked).
- **Expect:** Chandra drops from 5 to 1 loyalty and her ability triggers once, dealing 4 damage to you — not twice for 2.

### Priest of Yawgmoth: mana equal to the sacrificed artifact's mana value
- **Do:** Activate Priest of Yawgmoth, sacrificing Mind Stone.
- **Expect:** Mind Stone goes to your graveyard and you get {B}{B} (its mana value is 2), enough to cast Night's Whisper.

### Oathsworn Knight: blocked by two creatures, loses one counter
- **Do:** Attack with Oathsworn Knight. As Bob, block it with both Grizzly Bears and Hill Giant.
- **Expect:** All the blockers' damage is prevented and the Knight goes from four +1/+1 counters to three — not two.

## Engine rules gaps closed (2026-10-25)

### Armadillo Cloak: a trampler blocked triggers once
- **Do:** Attack with the cloaked Grizzly Bears. As Bob, block it with his Grizzly Bears.
- **Expect:** One Armadillo Cloak trigger goes on the stack, and you gain 4 life — 2 for the blocker and 2 for Bob together, not two triggers of 2.

### Relic Vial: your only Cleric dying still drains
- **Do:** Activate Relic Vial, sacrificing Abbey Matron.
- **Expect:** You draw a card, and Relic Vial's trigger makes Bob lose 1 life and you gain 1, though you have no Cleric left.

### Dovin, Grand Arbiter: his +1 counts each creature that connects
- **Do:** Activate Dovin's +1. Attack Bob with both creatures; Bob doesn't block.
- **Expect:** Dovin goes from 3 to 4 loyalty, then gets one more loyalty counter for each creature that dealt Bob damage — 6.

### Lively Dirge: two creature cards with total mana value 4 or less
- **Do:** Cast Lively Dirge choosing only its second mode ({2}). Pick Hill Giant and Grizzly Bears.
- **Expect:** The prompt reads "up to 2 cards with total mana value 4 or less", and Hill Giant with Grizzly Bears (6 together) can't be confirmed. Grizzly Bears with Savannah Lions can.

### Will of the Jeskai: Bob chooses before your hand is discarded
- **Do:** Cast Will of the Jeskai, wheel mode. Answer yes. As Bob, look at your hand before answering yes.
- **Expect:** When Bob is asked, your Grizzly Bears is still in your hand. Once he answers, both hands go to the graveyards and each of you draws five.

### Fire Covenant: X life, X damage divided
- **Do:** Cast Fire Covenant with X = 5, targeting Bob's Grizzly Bears and Hill Giant. Give the Bears 2 and the Giant 3.
- **Expect:** The division step shares out 5 (the X you chose), you pay 5 life, and both creatures die.

### Dismember: pay its Phyrexian mana with life by choice
- **Do:** Cast Dismember on Bob's Hill Giant. When asked, pick "2 with life (4 life)".
- **Expect:** You pay 4 life and only one Swamp taps; two stay untapped. The Giant dies.

### Circle of Protection: Red: a dead creature's trigger as the source
- **Do:** Lightning Bolt Bob's Mudbutton Torchrunner. With its trigger on the stack, activate Circle of Protection: Red and click the trigger's entry on the stack.
- **Expect:** The trigger's entry lights up and can be picked as the source. When it resolves, its 3 damage to you is prevented.

### Lathiel, the Bounteous Dawn: up to that many counters
- **Do:** Cast Chaplain's Blessing (gain 5 life). Pass to your end step. Target Grizzly Bears and Hill Giant, and give them 1 and 2.
- **Expect:** The division step reads "Divide up to 5 +1/+1 counters", and Cast works at 3 of 5. The Bears get one counter and the Giant two.

## Emerge (2026-10-23)

### Wretched Gryff: emerge, sacrificing a creature to pay less
- **Do:** Click Wretched Gryff in your hand and look at its ways to cast. Cast it the emerge way.
- **Expect:** One choice reads "(emerge, sacrificing Hill Giant: −4)"; there's none for Grizzly Bears (it would leave {3}{U}, more than your two Islands). Hill Giant goes to your graveyard, both Islands tap, and you draw a card as the Gryff is cast.

### Sinuous Vermin: menace once it's monstrous
- **Do:** Activate Sinuous Vermin's monstrosity.
- **Expect:** It gets three +1/+1 counters and shows menace; it didn't have menace before.

## Werewolves (2026-10-23)

### Hinterland Logger: transforms after a turn with no spells
- **Do:** Cast nothing and pass the turn.
- **Expect:** As Bob's turn begins, Hinterland Logger transforms into Timber Shredder (4/2, trample).

### Startled Awake: comes back from the graveyard as Persistent Nightmare
- **Do:** Activate Startled Awake's ability in your graveyard ({3}{U}{U}).
- **Expect:** It enters as Persistent Nightmare, a 1/1 with skulk — not as the sorcery, and not left in your graveyard.

### Boulder Salvo: its surge cost is offered after you cast another spell
- **Do:** Click Boulder Salvo in your hand and look at its ways to cast. Then cast Shock at Bob and look again.
- **Expect:** At first only its {4}{R} cost is offered (you can't pay it). After Shock, a second choice reads "surge {1}{R}", and casting it that way kills Grizzly Bears.

### Lava Coil: a creature that survives it is exiled when it dies later that turn
- **Do:** Cast Lava Coil on Bob's Colossal Dreadmaw, then cast Shock on it.
- **Expect:** The Dreadmaw survives Lava Coil (6/6 with 4 damage). Shock kills it, and it goes to exile, not Bob's graveyard.

## Renown (2026-10-24)

### Goblin Glory Chaser: menace once it's renowned
- **Do:** Attack Bob with Goblin Glory Chaser.
- **Expect:** It deals 1 damage, gets a +1/+1 counter and shows menace; it didn't have menace before.

### Aragorn, Hornburg Hero: the hit that makes a creature renowned doesn't double its counters
- **Do:** Attack Bob with Grizzly Bears. Next turn, attack with it again.
- **Expect:** The first hit gives the Bears one +1/+1 counter (renown), not two. The second hit doubles it to two counters.

## Dash and bolster (2026-10-24)

### Screamreach Brawler: dashed in, it attacks at once and comes back to your hand
- **Do:** Click Screamreach Brawler and cast it the "(dash)" way. Attack Bob with it, then pass to your end step.
- **Expect:** It can attack the turn it arrives. At the beginning of your end step it returns to your hand.

### Ragavan, Nimble Pilferer: the command zone offers both ways to cast it
- **Do:** Click Ragavan in your command zone.
- **Expect:** A menu offers "Cast Ragavan, Nimble Pilferer" and "Cast Ragavan, Nimble Pilferer (dash)". The dash one taps both Mountains, and Ragavan can attack this turn.

### Dromoka's Gift: bolster asks only between the creatures tied for least toughness
- **Do:** Cast Dromoka's Gift.
- **Expect:** You're asked to choose one of your two Grizzly Bears — Craw Wurm can't be picked. The one you choose gets four +1/+1 counters.
## X targets after another target (2026-10-23)

### Spinning Wheel Kick: X counts only the creatures it hits
- **Do:** Cast Spinning Wheel Kick with X=2. Pick your Hill Giant, then Bob's Grizzly Bears and Gray Ogre.
- **Expect:** After the Hill Giant both of Bob's creatures can be picked. With one picked, Done stays greyed out; picking the second casts the spell. Hill Giant deals 3 damage to each, and both die.

## Bestow (2026-10-25)

### Gnarled Scarhide: bestowed, it's an Aura, and a creature again once the host dies
- **Do:** Cast Gnarled Scarhide the "(bestow)" way onto your Grizzly Bears. Then cast Murder on the Bears.
- **Expect:** The Scarhide sits on the Bears as an Aura (they're 4/3 and can't block). When the Bears die, the Scarhide stays on the battlefield as a 2/1 creature, not in the graveyard.

## Tribute (2026-10-25, Born of the Gods)

### Pharagax Giant: the opponent decides whether to pay tribute
- **Do:** Cast Pharagax Giant. When Bob is asked, choose "Don't".
- **Expect:** Bob's banner reads "Pharagax Giant — Tribute 2: you may put 2 +1/+1 counters on it", with "Put 2 +1/+1 counters on it" and "Don't". The Giant enters as a 3/3 and deals 5 damage to Bob.
- **Not a bug:** Choosing "Put 2 +1/+1 counters on it" instead has it enter as a 5/5 and deal no damage.

### Snake of the Golden Grove: with two opponents, you choose who decides tribute
- **Do:** Cast Snake of the Golden Grove. Choose Carol when asked.
- **Expect:** Your banner reads "Snake of the Golden Grove — Tribute 3: choose an opponent", with Bob and Carol as buttons. Then Carol, not Bob, is asked whether to put 3 +1/+1 counters on it.

## Flash, then sacrificed at cleanup (2026-10-26, Visions)

### Spider Climb: cast at instant speed, it's sacrificed in the cleanup step
- **Do:** Pass to your end step, then cast Spider Climb on your Grizzly Bears. Keep passing.
- **Expect:** The Bears are 2/5 with reach for the rest of the turn. As the turn ends, "Sacrifice Spider Climb at the beginning of the next cleanup step." goes on the stack and resolves: Spider Climb is in your graveyard and the Bears are 2/2 when Bob's turn begins.
- **Not a bug:** Cast in your main phase with nothing on the stack, Spider Climb stays.

## Fuse (2026-10-26, Dragon's Maze)

### Turn // Burn: cast fused, both halves resolve, left first
- **Do:** Click Turn // Burn in your hand and choose "Cast Turn // Burn". Target bob's Hill Giant for Turn, then the same Hill Giant for Burn.
- **Expect:** The card offers three casts: Turn, Burn and Turn // Burn. Cast fused, it taps five lands, and the Giant becomes a 0/1 and then dies to Burn's 2 damage.

## Cipher (2026-10-26, Gatecrash)

### Shadow Slice: encoded on a creature, it casts again when that creature hits
- **Do:** Cast Shadow Slice at Bob. When asked, pick your Grizzly Bears. Attack Bob with the Bears, and when asked, cast the copy at Bob.
- **Expect:** Bob goes to 17, and your banner reads "Cipher — exile Shadow Slice encoded on a creature you control?". Shadow Slice goes to exile, not your graveyard. After the Bears' 2 damage, "Whenever this creature deals combat damage to a player, you may copy the encoded card (Shadow Slice) …" goes on the stack; casting the copy for free takes Bob to 12. Shadow Slice is still in exile.
- **Not a bug:** Choosing no creature puts Shadow Slice in your graveyard.

## Conspire (2026-10-26, Shadowmoor)

### Burn Trail: paying conspire taps two red creatures and copies it
- **Do:** Cast Burn Trail at Bob. When asked, choose the conspire option, then pick Raging Goblin and Goblin Piker. Keep Bob as the copy's target.
- **Expect:** The prompt reads "Conspire — tap two untapped creatures you control that share a color with Burn Trail to copy it". Only the two Goblins can be picked, not Grizzly Bears. Both tap, the copy resolves first, and Bob goes to 14.

### Burn Trail: no conspire prompt without two creatures that share its colour
- **Do:** Cast Burn Trail at Bob (your creatures are one red Goblin and a green Bears).
- **Expect:** No conspire prompt; Bob goes to 17.

### Wort, the Raidmother: two conspire prompts on Burn Trail
- **Do:** Cast Burn Trail at Bob. Accept both conspire prompts, tapping two creatures for each.
- **Expect:** Two conspire prompts, one after the other, and two copies: Bob goes to 11.
- **Not a bug:** Wort and the Goblin Warrior token can be tapped for it: they're red too.

## Licids (2026-10-26, batch 181)

### Enraging Licid: it becomes an Aura, and you can pay to make it a creature again
- **Do:** Click Enraging Licid and use its ability on your Grizzly Bears. Then click the Licid (now on the Bears) and choose "End the effect — pay {R}".
- **Expect:** The Licid attaches to the Bears as an Aura and the Bears have haste. After paying {R} it's a 1/1 creature again on its own, and the Bears lose haste.

## Unleash and detain (2026-10-26, Return to Ravnica)

### Gore-House Chainwalker: unleash asks before it enters, and the counter stops it blocking
- **Do:** Cast Gore-House Chainwalker and pick '+1/+1 counter'. Pass to Bob's turn and let his Grizzly Bears attack.
- **Expect:** 'Gore-House Chainwalker - choose one [+1/+1 counter] [No counter]' appears before it enters. It's a 3/2, and when Bob attacks it isn't offered as a blocker.

### Azorius Arrester: a detained creature can't use its abilities until your next turn
- **Do:** Cast Azorius Arrester and target Bob's Prodigal Sorcerer. Pass to Bob's turn, switch to Bob and try to activate the Sorcerer.
- **Expect:** The Sorcerer's ability can't be activated and it can't attack. On your next turn, it can be activated again.

## Miracle (2026-10-26)

### Thunderous Wrath: reveal and cast for its miracle cost
- **Do:** Cast Divination. When asked about Thunderous Wrath, choose Reveal, then cast it at Bob for {R}.
- **Expect:** The banner reads "Miracle — reveal Thunderous Wrath to cast it for {R}?" with Reveal and Keep hidden. A "Miracle" trigger goes on the stack, then the cast offer says "for its miracle cost, {R}". Bob goes to 15; only the Mountain taps for it.

### Thunderous Wrath: keeping a miracle hidden
- **Do:** Cast Divination and choose Keep hidden for Thunderous Wrath, then switch to Bob.
- **Expect:** No trigger goes on the stack and Wrath stays in your hand. Bob's view never names it; while you were asked, Bob's banner only said you were deciding on a miracle.

### Latchkey Faerie: its prowl cost is offered once a Rogue has hit a player
- **Do:** Attack with Prickly Boggart, then in your second main phase look at Latchkey Faerie in your hand.
- **Expect:** Before combat it costs {3}{U} only. After the Boggart deals damage, a "prowl {2}{U}" way to cast it appears; cast that way, it draws you a card as it enters.

### Waterspout Weavers: kinship reveals the top card at your upkeep
- **Do:** Pass the turn and come back to your upkeep.
- **Expect:** You're shown the top card of your library (a Merfolk) and may reveal it; if you do, your creatures gain flying until end of turn, and the card stays on top to be drawn.

## Soulbond (2026-10-26, batch 185)

### Silverblade Paladin: soulbond pairs it with a creature you choose
- **Do:** Cast Silverblade Paladin. When its soulbond trigger resolves, pick Hill Giant on the board.
- **Expect:** You're asked to choose one of Grizzly Bears or Hill Giant (or none). Paladin and Hill Giant both have double strike; Grizzly Bears doesn't.

## Buyback with a non-mana cost (2026-10-26, Exodus)

### Pegasus Stampede: buyback sacrifices a land
- **Do:** Cast Pegasus Stampede with buyback and sacrifice a Plains when asked.
- **Expect:** A second cast offer reads "buyback Sacrifice a land" beside the plain cast. A 1/1 flying Pegasus enters, the Plains goes to your graveyard and Pegasus Stampede comes back to your hand.

## "Only if you've been attacked this step" (2026-10-26, Portal)

### Just Fate: castable only once you've been attacked
- **Do:** Pass the turn. When the opponent's Hill Giant attacks you, cast Just Fate on it in the declare attackers step.
- **Expect:** Just Fate isn't castable in your own main phase, nor on the opponent's turn before attackers are declared. Once the Giant attacks you it is, and the Giant is destroyed before blocks.

## Ripple (2026-10-26, Coldsnap)

### Surging Sentinels: ripple casts the copy it reveals for free
- **Do:** Cast Surging Sentinels. Say yes to revealing the top four cards, cast the second Surging Sentinels offered, then order the other three cards when asked.
- **Expect:** Only the Surging Sentinels among the four is offered, cast without paying. Both Sentinels end up on the battlefield, and Grizzly Bears, Hill Giant and Island go to the bottom of your library in the order you picked. The second Sentinels asks to reveal again.

## Looking at a player's hand (2026-10-26, Urza's Saga)

### Sorcerous Sight: looking at an opponent's hand
- **Do:** Cast Sorcerous Sight targeting the opponent.
- **Expect:** A popup titled "Looking at Bob's hand" shows every card in their hand, with nothing to pick and a "Done" button. Closing it draws you a card; the opponent's hand is unchanged.

### Discordant Dirge: choose up to as many cards as its verse counters
- **Do:** Activate Discordant Dirge (it has 2 verse counters), targeting the opponent.
- **Expect:** A popup shows the opponent's whole hand and lets you pick up to 2 cards (or none). The cards you pick go to their graveyard.

## Epic (2026-10-26, Saviors of Kamigawa)

### Endless Swarm: a copy each upkeep, and no more spells
- **Do:** Cast Endless Swarm, then try to cast Grizzly Bears. Pass the turn and come back to your upkeep.
- **Expect:** You get a Snake for each card in your hand, and an emblem appears. Grizzly Bears can't be cast any more. At your upkeep a copy of Endless Swarm resolves and makes more Snakes; still only one emblem.

## Splice (2026-10-26, Betrayers of Kamigawa)

### Desperate Ritual: splicing Spiritual Visit onto it
- **Do:** Click Desperate Ritual in your hand and pick the way to cast it that says "splicing Spiritual Visit {W}".
- **Expect:** All three lands are tapped for it. Spiritual Visit is shown revealed and stays in your hand. You get a 1/1 Spirit token and {R}{R}{R} in your mana pool.

## Horsemanship (2026-10-26, Portal Three Kingdoms)

### Shu Cavalry: only horsemanship blocks it
- **Do:** Attack with Shu Cavalry and Grizzly Bears. Switch to Bob and declare blockers.
- **Expect:** Serra Angel can block only the Bears (flying doesn't count). Wei Scout can block either attacker.

## Forecast (2026-10-26, Dissension)

### Skyscribing: forecast from your hand in your upkeep, once a turn
- **Do:** In your main phase, look for Skyscribing's forecast ability, then pass the turn and come back to your upkeep. Use it there, then try it again.
- **Expect:** It isn't offered in your main phase. In your upkeep it is: everyone draws a card, the card is shown to the table, and Skyscribing stays in your hand. It isn't offered a second time that upkeep; it is again at your next upkeep.

## Abilities while suspended (2026-10-26, Time Spiral)

### Greater Gargadon: sacrificing to it from exile
- **Do:** Suspend Greater Gargadon from your hand. Open your exile, click Activate under the Gargadon, pick its ability and sacrifice Grizzly Bears.
- **Expect:** The Gargadon goes to exile with 10 time counters. Its ability is offered there (not before it's suspended), and once it resolves it has 9 time counters and the Bears are in your graveyard.

## Flip cards (2026-10-26, Champions and Betrayers of Kamigawa)

### Callow Jushi: flips into Jaraku at the end step
- **Do:** Pass to your end step and say yes when asked to flip Callow Jushi.
- **Expect:** The card now reads Jaraku the Interloper, a legendary 3/4 Spirit, still with its two ki counters. Hovering it shows Callow Jushi beside it, the same picture.

## Revealing cards from your hand (2026-10-26, Urza's Destiny)

### Scent of Ivy: reveal green cards from your hand, which stay there
- **Do:** Cast Scent of Ivy on your Grizzly Bears. When asked, pick Llanowar Elves and Giant Growth.
- **Expect:** The prompt reads "Choose any number of cards to reveal from your hand" and offers only the two green cards, not Lightning Bolt. The Bears become 4/4 and both green cards are still in your hand, shown as revealed.

## A damage trigger's "that creature" (2026-10-26, Champions of Kamigawa)

### Matsu-Tribe Sniper: the flier it damages stays tapped
- **Do:** Tap Matsu-Tribe Sniper to deal 1 damage to the opponent's Serra Angel, then pass the turn.
- **Expect:** The Angel is tapped as soon as the trigger resolves, and it stays tapped through the opponent's untap step (it still has 1 damage marked until the turn ends).

## Two kicker costs (2026-10-27, Apocalypse)

### Anavolver: kick it with either kicker, or both
- **Do:** Click Anavolver in your hand.
- **Expect:** Four ways to cast it: unkicked, and kicked for {1}{U}, for {B} and for {1}{U}{B}. Cast it with {1}{U}{B}: it enters as a 6/6 with flying and "Pay 3 life: Regenerate this creature."

## Amplify and provoke (2026-10-27, Legions)

### Glowering Rogon: amplify reveals Beasts from your hand
- **Do:** Cast Glowering Rogon. When asked, pick Krosan Vorine and Brontotherium.
- **Expect:** The prompt offers the two Beasts, not Grizzly Bears. Both stay in your hand, shown as revealed, and the Rogon enters as a 6/6 with two +1/+1 counters.

### Goblin Grappler: the provoked creature has to block it
- **Do:** Attack with Goblin Grappler, target the tapped Grizzly Bears with its trigger and say yes. As Bob, try to confirm blockers with none, then with Hill Giant blocking.
- **Expect:** The Bears untap. Confirm stays disabled with "Grizzly Bears must block if able" until the Bears block the Grappler.

## Discard X cards as a spell's cost (2026-10-27, Torment)

### Sickening Dreams: choose X, then discard that many
- **Do:** Cast Sickening Dreams and choose X = 2.
- **Expect:** X goes no higher than 3 (the other cards in your hand). You're asked to discard two cards as it's cast; it then deals 2 damage to each creature and each player, and the Grizzly Bears die.

## Skipping an untap step (2026-10-27, recheck list R5)

### Heliod's Intervention: choose the mode, then X, then exactly X targets
- **Do:** Cast Heliod's Intervention, choose "Destroy X target artifacts and/or enchantments", then X = 2.
- **Expect:** X is asked after the mode. The targeting prompt asks for exactly two artifacts or enchantments; after picking two of Bob's Sol Rings both are destroyed and the third stays.

### Patch Up: only cards that fit under total mana value 3
- **Do:** Cast Patch Up and pick Grizzly Bears from your graveyard first.
- **Expect:** The graveyard popup offers all three ("choose 0-3"). After the Bears, Centaur Courser can't be added (it would take the total past 3) but Savannah Lions can. Confirm returns the Bears and the Lions to the battlefield.

### Heroic Feast: up to as many targets as the life you gained
- **Do:** Activate the Food token (pay {2}, tap and sacrifice it) and let it resolve.
- **Expect:** You gain 3 life, then Heroic Feast asks for up to three creatures you control. Each one chosen gets a +1/+1 counter.

### Avizoa: you skip your next untap step
- **Do:** Activate Avizoa's {0} ability, then pass until your next turn.
- **Expect:** Avizoa is 4/4 until end of turn. On your next turn the log says "Alice skips their untap step" and your tapped Islands stay tapped; on the turn after that they untap as usual.

## Protection from the color of your choice (2026-10-28, need-keys Phase 2: the grant-protection family)

### Gods Willing: choose the colour as it resolves
- **Do:** Cast Gods Willing on your Grizzly Bears. When it resolves, choose red.
- **Expect:** No colour is asked while casting. As it resolves the prompt offers five choices, "Protection from white" to "Protection from green". After red, the Bears' card text ends "Protection from red until end of turn" and the log says "Grizzly Bears gains protection from red until EOT"; then you scry 1.

### Flickering Ward: naming its own colour doesn't knock it off
- **Do:** Cast Flickering Ward on your Grizzly Bears and choose White as it enters.
- **Expect:** The prompt reads "Flickering Ward — choose a color" with White, Blue, Black, Red and Green. The Ward stays attached and the Bears have protection from white. Casting Pacifism on the Bears isn't offered: they can't be targeted by it.

## Naming a card (2026-10-28, need-keys Phase 2: the choose-card-name family)

### Pithing Needle: name a card from the search as it enters
- **Do:** Cast Pithing Needle. In the popup, type "mind" in the search box and pick Mind Stone.
- **Expect:** The popup reads "Pithing Needle — choose a card name", with Bob's Prodigal Sorcerer first under "Suggested". The search narrows thousands of names as you type. After Mind Stone the log says "Alice names Mind Stone for Pithing Needle".

### Sorcerous Spyglass: see the opponent's hand before naming
- **Do:** Cast Sorcerous Spyglass. Choose Bob when asked whose hand to look at.
- **Expect:** The naming popup shows "In the hand you looked at" with Bob's Lightning Bolt and Counterspell as chips. Picking one names it.

### Alhammarret, High Arbiter: only a revealed nonland card can be named
- **Do:** Cast Alhammarret, High Arbiter.
- **Expect:** Bob's hand is revealed (Lightning Bolt and a Forest). The popup offers Lightning Bolt alone, not the Forest. After naming it, Bob can't cast Lightning Bolt.

### Brain Pry: the name is chosen as it resolves, nonland only
- **Do:** Cast Brain Pry targeting Bob, and type "forest" in the search when the popup opens.
- **Expect:** No name is asked while casting. As it resolves the popup reads "Brain Pry — choose a nonland card name" and "forest" finds no Forest card itself. Naming Lightning Bolt makes Bob discard his Lightning Bolt.

## Banding (2026-10-28, need-keys Phase 2: the banding family)

### Benalish Hero: attack in a band, and divide the blocker's damage
- **Do:** Click Benalish Hero and Grizzly Bears to attack Bob. Click **Band…**, click both on the board, then **Make band** and **Attack with 2**. As Bob, block the Bears with Hill Giant.
- **Expect:** The bar shows "Band 1: Benalish Hero + Grizzly Bears". The Giant blocks both: its badge reads "🛡 Grizzly Bears +1" with two arrows. Back as Alice you're asked "Banding: you divide Hill Giant's 3 damage"; put all 3 on the Hero and the Bears live.

### Benalish Hero: a band takes only one creature without banding
- **Do:** Click Benalish Hero, Grizzly Bears and Hill Giant to attack Bob. Click **Band…**, click all three, **Make band**, then **Attack with 3**.
- **Expect:** The attack is refused with "… can't attack as a band" and nothing attacks; the band can be broken up with its ✕ and the attack made again.

### Benalish Hero: the defender divides a trampler's damage
- **Do:** Attack Bob with Colossal Dreadmaw. As Bob, block it with Benalish Hero.
- **Expect:** Bob is asked "Banding: you divide Colossal Dreadmaw's 6 damage (trample)", starting with all 6 on the Hero and none to Bob. Confirming leaves Bob's life where it was.

## Searching an opponent's zones (2026-10-28, need-keys Phase 2: the search-opponent-library family)

### Bribery: take a creature from the opponent's library
- **Do:** Cast Bribery targeting Bob.
- **Expect:** A popup reads "Choose a card from Bob's cards to put onto the battlefield under your control", listing only Bob's creature cards (Hill Giant, Colossal Dreadmaw). The one you pick enters on your side; the log shows Bob shuffling.

### Cranial Extraction: the graveyard's copies go whatever you pick
- **Do:** Cast Cranial Extraction targeting Bob and name Lightning Bolt. Pick nothing and confirm.
- **Expect:** The popup lists Bob's Lightning Bolts in his hand and library only, and its title ends "— the 1 in the graveyard go too". Bob's graveyard Bolt is exiled; the others stay.

### Praetor's Grasp: the exiled card is yours to play, face down to Bob
- **Do:** Cast Praetor's Grasp targeting Bob and pick his Lightning Bolt. Then cast it from exile at Bob.
- **Expect:** The popup reads "Choose a card from Bob's cards to exile face down". The Bolt sits in exile face down for Bob, face up for you, and can be cast from there; Bob goes to 17.

## Lost abilities, block limits and chosen types (2026-10-28, need-keys Phase 2: three families)

### Two-Headed Giant of Foriys: block two attackers with one creature
- **Do:** Attack Bob with both Grizzly Bears. As Bob, click the Giant and one Bears, then the Giant again and the other Bears; confirm the blocks.
- **Expect:** After the second pair the Giant's badge reads "🛡 Grizzly Bears +1" and both Bears show as blocked. In damage Bob divides the Giant's 4 damage between them; both Bears die and so does the Giant.
- **Not a bug:** Clicking the Giant a third time takes it out of both blocks.

### Lignify: the enchanted creature loses its abilities
- **Do:** Cast Lignify on Bob's Serra Angel.
- **Expect:** The Angel shows 0/4, is a Treefolk only, and its rules text and its flying and vigilance are gone.

### Mistform Stalker: it becomes the creature type you choose
- **Do:** Activate Mistform Stalker's {1} ability and pick Goblin in the creature type search.
- **Expect:** The search offers every creature type. The Stalker's type line reads Goblin, not Illusion, until end of turn.

## Each player chooses, shared graveyards, repeating (2026-10-28, need-keys Phase 2: three families)

### Show and Tell: both cards enter together
- **Do:** Cast Show and Tell. Put Soul Warden onto the battlefield when asked.
- **Expect:** Bob is asked after you; your Soul Warden stays in your hand until he has chosen. Then both cards enter at once and you gain 1 life from Bob's creature entering.

### Harsh Mercy: each player names a creature type
- **Do:** Cast Harsh Mercy and pick Bear in the creature type search.
- **Expect:** The log shows your choice ("chooses Bear"), then Bob's; neither is called a vote. Your Grizzly Bears survive; every creature of no chosen type is destroyed.

### Ad Nauseam: you decide after each card
- **Do:** Cast Ad Nauseam. Answer "Repeat this process?" with yes once, then no.
- **Expect:** Each card is revealed and put into your hand, and you lose life equal to its mana value. After the second card it stops.

### Witness the Future: only the target player's graveyard
- **Do:** Cast Witness the Future targeting Bob.
- **Expect:** Only Bob's graveyard cards can be picked next (up to four); your own aren't offered. They go into Bob's library, then you take one of your top four cards.

## Granted statics, land types, exchanging control (2026-10-29, need-keys Phase 2: four families)

### Tideshaper Mystic: choose a basic land type
- **Do:** Tap Tideshaper Mystic targeting Bob's Yavimaya Coast, then pick Swamp.
- **Expect:** "Tideshaper Mystic — choose a basic land type" offers Plains, Island, Swamp, Mountain and Forest as buttons. The Coast's type line reads Swamp until end of turn, and it taps only for {B}.

### Blood Moon: nonbasic lands are Mountains
- **Do:** Cast Blood Moon.
- **Expect:** Your Yavimaya Coast reads Mountain and taps only for {R}; its own mana ability is gone. Your Forest is unchanged.

### Ghirapur Guide: small creatures can't block it
- **Do:** Activate Ghirapur Guide targeting itself, then attack Bob with it.
- **Expect:** As Bob, Grizzly Bears can't be picked to block the Guide; Hill Giant can.

### Switcheroo: two creatures change hands
- **Do:** Cast Switcheroo targeting your Grizzly Bears and Bob's Hill Giant.
- **Expect:** The Hill Giant moves to your side and the Bears to Bob's, both at once.

## Counters chosen, modal activations, an Aura's lock (2026-10-29, need-keys Phase 2: four families)

### Ghave, Guru of Spores: pick the creature that gives up a counter
- **Do:** Activate Ghave's "{1}, Remove a +1/+1 counter from a creature you control" ability. Click Grizzly Bears on the board, then **Remove**.
- **Expect:** The banner reads "Remove a +1/+1 counter to pay the cost". Bears lose their counter, Ghave keeps five, and you get a Saproling.

### Tayam, Luminous Enigma: three counters from among your creatures
- **Do:** Activate Tayam's ability. Click Tayam once and Grizzly Bears twice (or use the steppers), then **Remove**.
- **Expect:** **Remove** stays greyed out until exactly three are picked. Tayam loses vigilance, the Bears go back to 2/2, and you mill three.
- **Not a bug:** Hill Giant's -1/-1 counter can be one of the three too.

### Cankerbloom: each mode is its own activation
- **Do:** Click Cankerbloom.
- **Expect:** The menu lists "{1}, Sacrifice this creature: Destroy target artifact.", "… Destroy target enchantment." and "… Proliferate." as three entries. Picking the first asks for an artifact target only.

### Arrest: the enchanted creature's abilities can't be activated
- **Do:** Cast Arrest on Bob's Prodigal Pyromancer.
- **Expect:** Bob's Pyromancer never pings again, and can't attack or block. Your own Pyromancer still can.


## Targets another player chooses (2026-10-29, need-keys Phase 2: build-family, features only)

### Erithizon: the defending player picks the creature
- **Do:** Attack Bob with Erithizon. Switch to Bob when asked.
- **Expect:** As Bob, the banner reads "Choose the target of another player's Erithizon", and both Erithizon and Bob's Grizzly Bears can be picked. The +1/+1 counter goes on the creature Bob picked.

### Fact or Fiction: choose the pile for your hand
- **Do:** Cast Fact or Fiction. The bot separates the five cards; choose a pile.
- **Expect:** A popup titled "Fact or Fiction — Bob separated these" shows Pile 1 and Pile 2, each with a "Choose pile" button. The pile you choose goes to your hand and the other to your graveyard.

### Curator of Destinies: separate into a face-down and a face-up pile
- **Do:** Cast Curator of Destinies. In the popup, click cards to move them into "Pile 1 (face down)", then Confirm piles.
- **Expect:** The popup starts with all five cards in "Pile 2 (face up)" and a click moves a card across. After the bot chooses, its pile goes to your hand and the other to your graveyard.

### Liliana of the Veil: separate an opponent's permanents on the board
- **Do:** Activate Liliana's −6 on Bob. Click some of Bob's permanents, then Confirm piles in the banner.
- **Expect:** Bob's permanents are badged "Pile 2" and a click turns one to "Pile 1"; the banner counts both piles. Bob then sacrifices one pile and keeps the other.

## The chosen player (2026-10-29, need-keys Phase 2: build-family, features only)

### Black Vise: choose an opponent, named on the card
- **Do:** Cast Black Vise and choose one of the three opponents.
- **Expect:** The banner reads "Black Vise — Choose an opponent" with a button per opponent and none for you. Once it's on the battlefield, its tile is flagged "chose" and that player's name, in their seat colour.

## Cards outside the game: the sideboard (2026-10-30, need-keys Phase 2: build-family)

### Burning Wish: take a sorcery from your sideboard
- **Do:** Cast Burning Wish. In the popup, pick Demonic Tutor and confirm.
- **Expect:** The popup reads "Choose a card from your sideboard to put into your hand" and offers Demonic Tutor alone, not Lightning Bolt or Grizzly Bears. Demonic Tutor is revealed to everyone and goes to your hand; Burning Wish goes to exile, and your panel's "sideboard" count drops from 3 to 2.

### Your sideboard: only you can look at it
- **Do:** Click "sideboard 2" in your player panel. Then open the Builder panel, click "Switch to Bob", and click "sideboard 2" on Alice's panel.
- **Expect:** As Alice, a popup titled "Your sideboard" shows Demonic Tutor and Lightning Bolt. As Bob, Alice's panel still reads "sideboard 2" but the link can't be opened.

### Coax from the Blind Eternities: an Eldrazi from your sideboard or from exile
- **Do:** Cast Coax from the Blind Eternities.
- **Expect:** The popup "Choose a card to put into your hand" offers both Angelic Aberration (from your sideboard) and the exiled Artisan of Kozilek, but not Lightning Bolt. Whichever you pick goes to your hand.

### Study Break: learn fetches a Lesson from your sideboard
- **Do:** Cast Study Break, skipping both targets. Answer No to "Learn: discard a card to draw a card?".
- **Expect:** A popup offers Academic Probation from your sideboard (not Grizzly Bears); it goes to your hand.
- **Not a bug:** Saying yes to the discard instead means no Lesson is offered.

## A value chosen as it resolves (2026-10-30, need-keys Phase 2: build-family)

### Void: choose a number as it resolves
- **Do:** Cast Void targeting Bob. When it resolves, step the number up to 2 and click Choose 2.
- **Expect:** Nothing is asked until Void resolves. The banner reads "Void — choose a number" with a −/+ stepper starting at 0 and no "of N". Bob's Grizzly Bears and Mind Stone are destroyed and his Llanowar Elves stays; Bob reveals his hand and discards the Grizzly Bears in it, keeping Lightning Bolt. The log reads "You choose 2 for Void" (or your seat's name).

### Persecute: choose a color as it resolves
- **Do:** Cast Persecute targeting Bob, and choose Red.
- **Expect:** The banner reads "Persecute — Choose a color" with White, Blue, Black, Red and Green buttons. Bob reveals his hand and discards Lightning Bolt and Lightning Helix (red and white); Grizzly Bears and Forest stay.

### Blood Oath: choose a card type
- **Do:** Cast Blood Oath targeting Bob, and choose creature.
- **Expect:** The banner reads "Blood Oath — Choose a card type" with nine buttons, artifact to sorcery, kindred and battle among them. Bob reveals his hand and loses 6 life (two creature cards).

### Ichormoon Gauntlet: choose a counter on the target
- **Do:** Cast Lightning Bolt at Bob. Target your Grizzly Bears with the Gauntlet's trigger, and choose shield.
- **Expect:** The banner reads "Ichormoon Gauntlet — Choose a kind of counter" with two buttons, +1/+1 and shield. The Bears end with two +1/+1 counters and two shield counters.
- **Known bug:** the cast can stall on "Resolving…" before the trigger's target is asked — BACKLOG's "Playback stalls when your cast triggers your own targeted ability", not this feature.

## Blocking minimums and "all or none" (2026-10-30, need-keys Phase 2: build-family, features only)

### Troll of Khazad-dûm: it takes three blockers
- **Do:** Attack Bob with Troll of Khazad-dûm. As Bob, block it with Grizzly Bears and Hill Giant, then add Gray Ogre.
- **Expect:** With two, Confirm stays disabled and the bar reads "Troll of Khazad-dûm needs 3+ blockers". With all three it confirms.

### Tromokratis: all of Bob's creatures block it, or none
- **Do:** Attack Bob with Tromokratis. As Bob, block it with Grizzly Bears, then add Hill Giant.
- **Expect:** With one, Confirm stays disabled: "Tromokratis must be blocked by all your creatures or none". With both it confirms.

## A mode chosen more than once (2026-10-30, need-keys Phase 2: build-family, features only)

### Fiery Confluence: choose the same mode three times
- **Do:** Cast Fiery Confluence. Click "deals 2 damage to each opponent" three times, then Confirm.
- **Expect:** The bar reads "Fiery Confluence — choose 3 (a mode may repeat — 0/3)", counting up as you click, and the mode shows "×3". Every mode greys out at 3/3 until Clear. Bob loses 6 life; his Grizzly Bears and Sol Ring stay.

### Mystic Confluence: one mode twice, each with its own target, four players
- **Do:** Cast Mystic Confluence. Click "Return target creature to its owner's hand" twice and "Draw a card" once, then Confirm. Target Bob's Grizzly Bears, then Carol's Hill Giant.
- **Expect:** You're asked for two creature targets, one after the other. Both creatures go back to their owners' hands, Dave's Gray Ogre stays, and you draw a card.

## Combat damage as though unblocked (2026-10-30, need-keys Phase 2: build-family, features only)

### Thorn Elemental: all of its damage past a blocker
- **Do:** Attack Bob with Thorn Elemental. As Bob, block it with Grizzly Bears. As you, click "All to Bob".
- **Expect:** The damage bar offers Confirm and "All to Bob" though there's one blocker and no trample. Bob goes to 33; Grizzly Bears survives and Thorn Elemental has 2 damage.

### Siege Behemoth: each blocked attacker its own choice, four players
- **Do:** Attack Bob with Siege Behemoth and Grizzly Bears. As Bob, block Siege Behemoth with Hill Giant and Grizzly Bears with Wall of Denial. As you, click "Confirm" for Siege Behemoth, then "All to Bob" for Grizzly Bears.
- **Expect:** You're asked once per attacker. Hill Giant dies, Wall of Denial survives, and Bob goes to 38.

## Another player helps pay (2026-10-31, need-keys Phase 2: build-family, features only)

### Charging Binox: Bob helps pay
- **Do:** Click "Cast Charging Binox (assist: Bob may pay up to 5)" under the card. As Bob, choose 4.
- **Expect:** Bob's bar reads "Charging Binox — assist: pay up to 5 of this spell's generic mana (less than 4 and the cast is undone) (0–5)". Charging Binox resolves onto your battlefield; four of Bob's Islands and your four Forests are tapped.
- **Not a bug:** clicking the card itself does nothing — the button says who you're asking.

### Charging Binox: too little help undoes the cast
- **Do:** Click "Cast Charging Binox (assist: Bob may pay up to 5)". As Bob, choose 2.
- **Expect:** The log says your cast of Charging Binox is undone. It's back in your hand, nothing is tapped, and you can try again.

### Gang Up: Carol helps pay for X, four players
- **Do:** Click "Cast Gang Up (X=3) (assist: Carol may pay up to 3)" and target Bob's Gray Ogre. As Carol, choose 3.
- **Expect:** Only Carol is offered (the others have no mana), at X=2 to 4. Carol's three Islands and one of your Swamps are tapped, and Gray Ogre dies.

## Choices by other players (2026-10-31, need-keys Phase 2: build-family, features only)

### Evangelize: Bob picks the creature you take
- **Do:** Cast Evangelize without buyback. As Bob, click Hill Giant.
- **Expect:** Bob's bar asks him to choose a target for your Evangelize, and only his creatures light up. Hill Giant comes under your control.

### Magus of the Arena: Bob picks the creature it fights
- **Do:** Activate Magus of the Arena and target Magus itself. As Bob, click Grizzly Bears.
- **Expect:** The ability's entry says "(Bob chooses)". Magus is tapped and Grizzly Bears dies.

### Library of Lat-Nam: Bob picks the mode
- **Do:** Cast Library of Lat-Nam. As Bob, choose the search. As you, pass priority.
- **Expect:** Bob, not you, is shown the two modes, and the log says Bob chose mode 2. As it resolves you search your library for a card to put into your hand.

### Barrin's Spite: Bob picks the one he sacrifices
- **Do:** Cast Barrin's Spite targeting Grizzly Bears and Hill Giant. As Bob, click Grizzly Bears and Confirm.
- **Expect:** Grizzly Bears goes to Bob's graveyard and Hill Giant to his hand.

### Wake to Slaughter: Bob picks the card for your hand
- **Do:** Cast Wake to Slaughter targeting Grizzly Bears and Hill Giant in your graveyard, and pass priority. As Bob, pick Hill Giant and Confirm.
- **Expect:** Bob's popup reads "Choose the card that returns to its owner's hand — the other enters the battlefield with haste". Hill Giant goes to your hand; Grizzly Bears enters your battlefield with haste.

### Volcanic Offering: Carol picks the other two, four players
- **Do:** Click "Cast Volcanic Offering (Carol chooses)", target Bob's Tropical Island and Hill Giant. As Carol, click Dave's Savannah and Gray Ogre. As you, pass priority.
- **Expect:** Carol is offered only lands and creatures you don't control (her own too). Both lands are destroyed, and Hill Giant and Gray Ogre die.
