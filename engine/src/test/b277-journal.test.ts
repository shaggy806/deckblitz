/**
 * B277: the turn journal (`journal.ts`, need-key themes step 3) and the cards
 * that prove it — Kid Loki, Kiora of Salt and Sand, Kíli the Resourceful,
 * Captain America, Living Legend (the flagged four), then the theme's keys:
 * counters you put this turn (Beast, Erudite Aerialist; Fractal Tender;
 * Sigardian Paladin), a land played this turn (Mercadian Atlas), cards put
 * into a graveyard this turn (Garna, the Bloodflame; Myojin of Grim Betrayal)
 * and life lost last turn (Feast on the Fallen, First Response, Paladin of
 * Atonement).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { entriesThisTurn, inJournalWindow } from "../journal.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** `by` puts `n` +1/+1 counters on `on`, as an effect they control would. */
function putCounter(game: Game, on: ObjectId, by: PlayerId = A, counter = "+1/+1", n = 1): void {
  game.debugApplyEffect(by, { kind: "add-counter", target: 0, counter, amount: n }, [ref(on)]);
  settle(game);
}

/** `player` loses `n` life, dealt as damage by a source of the other player's. */
const loseLife = (game: Game, player: PlayerId, n: number): void => {
  game.debugApplyEffect(player === A ? B : A, { kind: "damage", amount: n, target: 0 }, [ref(player)]);
  settle(game);
};

describe("the journal's windows and pruning", () => {
  it("last turn is the turn before this one; their last turn, that player's own", () => {
    const { game } = table({ players: 4 });
    nextTurn(game); // B's
    nextTurn(game); // C's
    expect(game.state.turn.number).toBe(3);
    expect(inJournalWindow(game.state, "last-turn", 2, A, A)).toBe(true);
    expect(inJournalWindow(game.state, "their-last-turn", 1, C, A)).toBe(true);
    expect(inJournalWindow(game.state, "their-last-turn", 2, C, B)).toBe(true);
    expect(inJournalWindow(game.state, "since-your-last-turn", 2, A, A)).toBe(true);
    expect(inJournalWindow(game.state, "since-your-last-turn", 1, A, A)).toBe(false);
  });

  it("keeps one round: what no window can name goes as a turn begins", () => {
    const { game } = table({ players: 4 });
    loseLife(game, A, 1);
    for (let i = 0; i < 4; i += 1) nextTurn(game);
    // Turn 5 is A's again: turn 1 is still A's last turn.
    expect(game.state.journal?.entries.some((e) => e.turn === 1)).toBe(true);
    nextTurn(game);
    // Turn 6, B's: every player's last turn is turn 2 or later.
    expect(game.state.journal?.entries.some((e) => e.turn === 1)).toBe(false);
    expect(game.state.journal?.game[A]?.["life-lost"]).toBe(1);
  });
});

describe("Kid Loki", () => {
  it("hexproof on a creature you put a +1/+1 counter on this turn, not one an opponent did", () => {
    const { game } = table();
    spawn(game, "Kid Loki");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    putCounter(game, mine, A);
    putCounter(game, theirs, B);
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
    expect(keywords(game, bare).has("hexproof")).toBe(false);
  });

  it("another kind of counter isn't one, and next turn it's over though the counter stays", () => {
    const { game } = table();
    spawn(game, "Kid Loki");
    const bears = spawn(game, "Grizzly Bears");
    putCounter(game, bears, A, "shield");
    expect(keywords(game, bears).has("hexproof")).toBe(false);
    putCounter(game, bears, A);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });

  it("a creature that left and came back is a new object (rule 400.7)", () => {
    const { game } = table();
    spawn(game, "Kid Loki");
    const bears = spawn(game, "Grizzly Bears");
    putCounter(game, bears, A);
    const stint = game.state.objects[bears].zoneChangeCount;
    game.debugApplyEffect(A, { kind: "flicker", target: 0, underYourControl: true }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].zoneChangeCount).not.toBe(stint);
    expect(counters(game, bears)).toBe(0);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });

  it("your second card drawn each turn puts a counter on it", () => {
    const { game } = table();
    const loki = spawn(game, "Kid Loki");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(counters(game, loki)).toBe(1);
    // It put that counter itself: you did, so Kid Loki has hexproof.
    expect(keywords(game, loki).has("hexproof")).toBe(true);
  });
});

describe("Kiora of Salt and Sand", () => {
  it("whenever you attack, after a loyalty ability this turn, untaps an attacker that can't be blocked", () => {
    const t = table();
    spawn(t.game, "Kiora of Salt and Sand");
    const jace = spawn(t.game, "Jace Beleren");
    const bears = spawn(t.game, "Grizzly Bears");
    loyalty(t.game, jace, 2);
    t.a.chooseTargetsFn = (_view, _source, _specs, options) => [options[0]?.find((o) => o.kind === "object" && o.object === bears) ?? null];
    attack(t.game, t.a, [bears]);
    settle(t.game);
    expect(t.game.state.objects[bears].tapped).toBe(false);
    expect(keywords(t.game, bears).has("unblockable")).toBe(true);
  });

  it("without one, nothing", () => {
    const t = table();
    spawn(t.game, "Kiora of Salt and Sand");
    const bears = spawn(t.game, "Grizzly Bears");
    attack(t.game, t.a, [bears]);
    settle(t.game);
    expect(t.game.state.objects[bears].tapped).toBe(true);
  });

  it("your planeswalkers have [−8]: an 8/8 Leviathan with hexproof — still one loyalty ability a turn", () => {
    const { game } = table();
    spawn(game, "Kiora of Salt and Sand");
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 9;
    const minus8 = game
      .legalActions(A)
      .find((a) => a.kind === "activate-ability" && a.source === jace && a.text.includes("8/8 blue Leviathan"));
    if (minus8?.kind !== "activate-ability") throw new Error("no granted [−8] offered");
    activate(game, jace, minus8.abilityIndex);
    expect(game.state.objects[jace].counters.loyalty).toBe(1);
    expect(tokensNamed(game, "Leviathan Token (Kiora of Salt and Sand)")).toBe(1);
    expect(() => loyalty(game, jace, 2)).toThrow();
  });
});

describe("Kíli the Resourceful", () => {
  const equipOffers = (game: Game, source: ObjectId): readonly string[] =>
    game.legalActions(A).flatMap((a) => (a.kind === "activate-ability" && a.source === source ? [a.text] : []));

  it("with an enduring story, {0} for the first equip each turn; not before", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const sword = spawn(game, "Vulshok Morningstar");
    spawn(game, "Kíli the Resourceful");
    expect(equipOffers(game, sword)).toEqual(["Equip {2}"]);
    // A third artifact or legendary: the story is told (storied, a check the
    // game makes as it goes on).
    enter(game, "Ornithopter");
    toStep(game, "begin-combat");
    expect(game.state.players[A].enduringStory).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(equipOffers(game, sword)).toEqual(["Equip {2}", "Equip {0}"]);
    const bears = spawn(game, "Grizzly Bears");
    const free = game
      .legalActions(A)
      .find((a) => a.kind === "activate-ability" && a.source === sword && a.text === "Equip {0}");
    if (free?.kind !== "activate-ability") throw new Error("no Equip {0}");
    activate(game, sword, free.abilityIndex, { targets: [ref(bears)] });
    expect(equipOffers(game, sword)).toEqual(["Equip {2}"]);
  });

  it("another Dwarf or Equipment you control entering draws a card, once each turn", () => {
    const { game } = table();
    spawn(game, "Kíli the Resourceful");
    const before = hand(game).length;
    enter(game, "Vulshok Morningstar");
    enter(game, "Vulshok Morningstar");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Captain America, Living Legend", () => {
  it("the first time a creature of yours becomes tapped on your turn it untaps; the second time it stays", () => {
    const { game } = table();
    spawn(game, "Captain America, Living Legend");
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(game.state.objects[sorcerer].tapped).toBe(false);
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(game.state.objects[sorcerer].tapped).toBe(true);
    expect(life(game, B)).toBe(18);
  });

  it("not on another player's turn", () => {
    const { game } = table();
    spawn(game, "Captain America, Living Legend");
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A);
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(game.state.objects[sorcerer].tapped).toBe(true);
  });

  it("tapped before it arrived this turn counts: the next tapping isn't the first", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    game.state.objects[sorcerer].tapped = false;
    spawn(game, "Captain America, Living Legend");
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(game.state.objects[sorcerer].tapped).toBe(true);
    expect(entriesThisTurn(game.state, "tapped").filter((e) => e.object === sorcerer)).toHaveLength(2);
  });
});

describe("counters you put this turn: Beast, Fractal Tender, Sigardian Paladin", () => {
  it("Beast flies after you put a +1/+1 counter on him, not after an opponent does", () => {
    const { game } = table();
    const beast = spawn(game, "Beast, Erudite Aerialist");
    putCounter(game, beast, B);
    expect(keywords(game, beast).has("flying")).toBe(false);
    putCounter(game, beast, A);
    expect(keywords(game, beast).has("flying")).toBe(true);
  });

  it("Fractal Tender: a Fractal with three counters at the end step you put any counter on it", () => {
    const { game } = table();
    const tender = spawn(game, "Fractal Tender");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Fractal Token")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    putCounter(game, tender, A, "shield");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Fractal Token")).toBe(1);
  });

  it("Sigardian Paladin: trample and lifelink once you've put a +1/+1 counter on any creature", () => {
    const { game } = table();
    const paladin = spawn(game, "Sigardian Paladin");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, paladin).has("trample")).toBe(false);
    putCounter(game, theirs, B);
    expect(keywords(game, paladin).has("trample")).toBe(false);
    putCounter(game, theirs, A);
    expect(keywords(game, paladin).has("trample")).toBe(true);
    expect(keywords(game, paladin).has("lifelink")).toBe(true);
  });
});

describe("a land played this turn: Mercadian Atlas", () => {
  it("draws at your end step only if you didn't play a land", () => {
    const { game, a } = table();
    a.chooseModesFn = (_view, min, max) => Array.from({ length: Math.max(min, Math.min(1, max)) }, (_u, i) => i);
    spawn(game, "Mercadian Atlas");
    const forest = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest } as never);
    settle(game);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
    nextTurn(game);
    nextTurn(game);
    const later = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(later + 1);
  });
});

describe("put into a graveyard this turn: Garna, Myojin of Grim Betrayal", () => {
  it("Garna returns the creature cards put into your graveyard this turn, from anywhere", () => {
    const { game } = table();
    const old = toGraveyard(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    const died = spawn(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(died)]);
    settle(game);
    const discarded = toHand(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "discard", amount: 1, target: "you" } as never, []);
    settle(game);
    enter(game, "Garna, the Bloodflame");
    expect(zone(game, died)).toBe("hand");
    if (zone(game, discarded) !== "battlefield") expect(zone(game, discarded)).toBe("hand");
    expect(zone(game, old)).toBe("graveyard");
  });

  it("Myojin: cast from hand it has its counter, and puts this turn's creature cards from every graveyard onto the battlefield", () => {
    const { game } = table();
    const theirs = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(theirs)]);
    settle(game);
    const myojin = spawn(game, "Myojin of Grim Betrayal");
    game.state.objects[myojin].counters.indestructible = 1;
    activate(game, myojin, 0);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
  });
});

describe("life lost last turn: Feast on the Fallen, First Response, Paladin of Atonement", () => {
  it("First Response makes a Soldier at the upkeep after a turn you lost life, not later", () => {
    const { game } = table();
    spawn(game, "First Response");
    loseLife(game, A, 2);
    nextTurn(game, "draw");
    expect(tokensNamed(game, "Soldier Token")).toBe(1);
    nextTurn(game, "draw");
    expect(tokensNamed(game, "Soldier Token")).toBe(1);
  });

  it("Feast on the Fallen: an opponent's life lost last turn, a counter on your creature", () => {
    const { game } = table();
    spawn(game, "Feast on the Fallen");
    const bears = spawn(game, "Grizzly Bears");
    loseLife(game, A, 2);
    nextTurn(game, "draw");
    expect(counters(game, bears)).toBe(0);
    loseLife(game, B, 1);
    nextTurn(game, "draw");
    expect(counters(game, bears)).toBe(1);
  });

  it("Paladin of Atonement grows after you lost life, and gains its toughness as it dies", () => {
    const { game } = table();
    const paladin = spawn(game, "Paladin of Atonement");
    loseLife(game, A, 3);
    nextTurn(game, "draw");
    expect(pt(game, paladin)).toEqual({ power: 2, toughness: 2 });
    const before = life(game, A);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(paladin)]);
    settle(game);
    expect(life(game, A)).toBe(before + 2);
  });

  it("four players: last turn is the one just ended, whoever's", () => {
    const { game } = table({ players: 4 });
    spawn(game, "First Response");
    nextTurn(game); // B's turn
    loseLife(game, A, 1);
    nextTurn(game, "draw"); // C's upkeep: A lost life during B's turn
    expect(tokensNamed(game, "Soldier Token")).toBe(1);
    expect(activePlayerOf(game.state)).toBe(C);
  });
});
