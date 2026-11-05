/**
 * Batch 265, group A: cards freed by the built need-key families (offering,
 * pawprints, land adventures, friend or foe, batched triggers, draw
 * replacements and more). One test for the clause of each most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table as baseTable,
  toExile,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Bob's seat of the table under test. */
const seats: { b?: ScriptedController } = {};
const table = (opts: Parameters<typeof baseTable>[0] = {}): ReturnType<typeof baseTable> => {
  const t = baseTable(opts);
  seats.b = t.b;
  return t;
};
const damage = (game: Game, amount: number, to: ObjectId | typeof A, by = B): void => {
  game.debugApplyEffect(by, { kind: "damage", amount, target: 0 }, [ref(to)], { source: spawn(game, "Hill Giant", by) });
  settle(game);
};
const draw = (game: Game, n = 1): void => {
  game.debugApplyEffect(A, { kind: "draw", amount: n }, []);
  settle(game);
};
/** Bob casts `name` (on his own next turn unless `newTurn` is false), then passes priority to alice. */
const bobCasts = (game: Game, name: string, land: string, n: number, newTurn = true): ObjectId => {
  if (newTurn) nextTurn(game);
  lands(game, land, n, B);
  const card = toHand(game, name, B);
  cast(game, card, { player: B, settle: false });
  game.dispatch({ type: "pass-priority", player: B });
  return card;
};
const onBattlefield = (game: Game, name: string, player = A): ObjectId[] =>
  named(game, name, player).filter((id) => zone(game, id) === "battlefield");

describe("lands and artifacts", () => {
  it("Moonring Island: its look needs two blue permanents", () => {
    const { game } = table();
    const island = spawn(game, "Moonring Island");
    game.state.objects[island].tapped = false;
    lands(game, "Island", 1);
    const looks = (): number =>
      game.legalActions(A).filter((o) => o.kind === "activate-ability" && o.source === island && o.abilityIndex === 1).length;
    spawn(game, "Storm Crow");
    expect(looks()).toBe(0);
    spawn(game, "Storm Crow");
    expect(looks()).toBe(1);
  });

  it("Boarded Window: 4 damage to you this turn exiles it at the end step, 3 doesn't", () => {
    const { game } = table();
    const window = spawn(game, "Boarded Window");
    damage(game, 3, A);
    toStep(game, "end");
    settle(game);
    expect(zone(game, window)).toBe("battlefield");
    nextTurn(game);
    damage(game, 4, A);
    game.advanceUntil((s) => s.turn.step === "end");
    settle(game);
    expect(zone(game, window)).toBe("exile");
  });

  it("Alhammarret's Archive: life gain doubles, and a draw outside the draw step's first is two", () => {
    const { game } = table();
    spawn(game, "Alhammarret's Archive");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(life(game)).toBe(26);
    const before = hand(game).length;
    draw(game);
    expect(hand(game).length).toBe(before + 2);
  });

  it("Dino DNA: a token copy of the imprinted creature card, as a 6/6 green Dinosaur with trample", () => {
    const { game } = table();
    const dna = spawn(game, "Dino DNA");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Wastes", 7);
    activate(game, dna, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    activate(game, dna, 1, { targets: [ref(bears)] });
    const [token] = onBattlefield(game, "Grizzly Bears");
    expect(pt(game, token)).toEqual({ power: 6, toughness: 6 });
    expect(subtypes(game, token)).toEqual(["Dinosaur"]);
    expect(keywords(game, token).has("trample")).toBe(true);
  });

  it("Chainsaw: two creatures dying together put one rev counter on it, +1/+0 to the equipped", () => {
    const { game } = table();
    const saw = spawn(game, "Chainsaw");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, saw, 0, { targets: [ref(bear)] });
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature", controlledBy: "opponent" } }, []);
    settle(game);
    expect(counters(game, saw, "rev")).toBe(1);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
  });

  it("Ace's Baseball Bat: first strike only while the equipped creature attacks", () => {
    const { game, a } = table();
    const bat = spawn(game, "Ace's Baseball Bat");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, bat, 1, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bear).has("first-strike")).toBe(false);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(game, bear).has("first-strike")).toBe(true);
  });

  it("Rootcoil Creeper: returns a card with flashback you own from exile", () => {
    const { game } = table();
    const creeper = spawn(game, "Rootcoil Creeper");
    const card = toExile(game, "Think Twice");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    activate(game, creeper, 2, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("hand");
    expect(zone(game, creeper)).toBe("exile");
  });

  it("Arcum's Whistle: unpaid, a creature that can't attack is destroyed at the end step", () => {
    const { game } = table();
    const whistle = spawn(game, "Arcum's Whistle");
    lands(game, "Wastes", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    game.state.objects[bear].tapped = true;
    lands(game, "Forest", 2, B);
    const asked: string[] = [];
    seats.b!.chooseModesFn = (_v, _min, _max, texts) => {
      asked.push(...texts);
      return [];
    };
    game.dispatch({ type: "pass-priority", player: B });
    activate(game, whistle, 0, { targets: [ref(bear)] });
    game.advanceUntil((s) => s.turn.step === "cleanup");
    expect(asked.some((t) => t.startsWith("Pay"))).toBe(true);
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("creatures", () => {
  it("Patron of the Nezumi: a permanent, token or not, put into an opponent's graveyard costs them 1 life", () => {
    const { game } = table();
    spawn(game, "Patron of the Nezumi");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(life(game, B)).toBe(19);
    destroy(game, spawn(game, "Soldier Token", B));
    expect(life(game, B)).toBe(18);
    destroy(game, spawn(game, "Grizzly Bears", A), B);
    expect(life(game, A)).toBe(20);
  });

  it("Patron of the Orochi: untaps Forests and green creatures, nothing else", () => {
    const { game } = table();
    const patron = spawn(game, "Patron of the Orochi");
    const forest = spawn(game, "Forest", A, { tapped: true });
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    activate(game, patron, 0);
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("Patron of the Moon: up to two land cards from hand onto the battlefield tapped", () => {
    const { game, a } = table();
    const patron = spawn(game, "Patron of the Moon");
    const one = toHand(game, "Island");
    const two = toHand(game, "Forest");
    lands(game, "Wastes", 1);
    a.chooseFromZoneFn = () => [one, two];
    activate(game, patron, 0);
    expect(zone(game, one)).toBe("battlefield");
    expect(game.state.objects[two].tapped).toBe(true);
  });

  it("Possessed Skaab: dying, it's exiled", () => {
    const { game } = table();
    const skaab = spawn(game, "Possessed Skaab");
    destroy(game, skaab);
    expect(zone(game, skaab)).toBe("exile");
  });

  it("Fungal Behemoth: its P/T counts the +1/+1 counters on your creatures", () => {
    const { game } = table();
    const behemoth = spawn(game, "Fungal Behemoth");
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 2;
    game.state.objects[behemoth].counters["+1/+1"] = 1;
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 5;
    expect(pt(game, behemoth)).toEqual({ power: 4, toughness: 4 });
  });

  it("Rhoda: an opponent's creature tapped other than by attacking gives her a counter", () => {
    const { game } = table();
    const rhoda = spawn(game, "Rhoda, Geist Avenger");
    const bear = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(bear)]);
    settle(game);
    expect(counters(game, rhoda)).toBe(1);
  });

  it("Gornog: a Warrior's attack makes a creature of that player a Coward, and Cowards pump attacking Warriors", () => {
    const { game, a } = table();
    const gornog = spawn(game, "Gornog, the Red Reaper");
    const bear = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: gornog, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(subtypes(game, bear)).toEqual(["Coward"]);
    expect(pt(game, gornog)).toEqual({ power: 3, toughness: 3 });
  });

  it("Gogo: becomes a copy named Gogo, and both get +2/+0 and haste", () => {
    const { game, a } = table();
    const gogo = spawn(game, "Gogo, Mysterious Mime");
    const giant = spawn(game, "Hill Giant");
    a.chooseModesFn = () => [0];
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, gogo)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, giant).has("haste")).toBe(true);
  });

  it("Valentin: an opponent's creature dying is exiled, and paying {2} makes a Pest", () => {
    const { game, a } = table();
    spawn(game, "Valentin, Dean of the Vein");
    lands(game, "Wastes", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    destroy(game, bear);
    expect(zone(game, bear)).toBe("exile");
    expect(tokensNamed(game, "Pest Token", A)).toBe(1);
  });

  it("Lisette: gaining life and paying {1} puts a counter on each of your creatures, with trample", () => {
    const { game, a } = table();
    game.state.objects[spawn(game, "Valentin, Dean of the Vein")].face = 1;
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    a.chooseModesFn = () => [0];
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(counters(game, bear)).toBe(1);
    expect(keywords(game, bear).has("trample")).toBe(true);
  });

  it("Electro: an instant cast adds {R}", () => {
    const { game } = table();
    spawn(game, "Electro, Assaulting Battery");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(game.state.players[A].manaPool.filter((m) => m.type === "R").length).toBe(1);
  });

  it("Electro: leaving, X paid deals X damage to target player", () => {
    const { game } = table();
    const electro = spawn(game, "Electro, Assaulting Battery");
    lands(game, "Wastes", 3);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(electro)]);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.result.over);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.result.over);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("War's Toll: an opponent tapping a land for mana taps all their lands", () => {
    const { game } = table();
    spawn(game, "War's Toll");
    nextTurn(game);
    const [one, two] = lands(game, "Forest", 2, B);
    activate(game, one, 0, { player: B });
    expect(game.state.objects[two].tapped).toBe(true);
  });

  it("Rewrite History: two creatures tapped at once draw once and add one plan counter", () => {
    const { game, a } = table();
    const plan = spawn(game, "Rewrite History");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    attack(game, a, [one, two]);
    expect(counters(game, plan, "plan")).toBe(1);
  });

  it("Blood Spatter Analysis: creatures dying together mill one and add one bloodstain counter", () => {
    const { game } = table();
    const blood = spawn(game, "Blood Spatter Analysis");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const library = game.state.zones.perPlayer[A].library.length;
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(counters(game, blood, "bloodstain")).toBe(1);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 1);
  });

  it("Ydwen Efreet: losing the flip, the creature it blocked alone is unblocked and hits", () => {
    const { game, a, b } = table({ seed: 3 });
    const efreet = spawn(game, "Ydwen Efreet", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: efreet, attacker: giant }];
    attack(game, a, [giant]);
    const unblocked = life(game, B) === 17;
    expect(game.state.objects[efreet].damageMarked).toBe(unblocked ? 0 : 3);
  });

  it("Sentinel of Lost Lore: the chosen mode exiles the target player's graveyard", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    a.chooseModesFn = (_v, _min, _max, texts) => [texts.findIndex((t) => t.startsWith("Exile target player"))];
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Sentinel of Lost Lore");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("spells", () => {
  it("You Look Upon the Tarrasque: Gather Your Courage gives +5/+5 and indestructible", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    cast(game, toHand(game, "You Look Upon the Tarrasque"), { modes: [1], targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, bear).has("indestructible")).toBe(true);
  });

  it("Unexpected Results: a land on top may go onto the battlefield, and the spell back to hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    a.chooseModesFn = () => [0];
    const spell = toHand(game, "Unexpected Results");
    const battlefield = game.state.zones.shared.battlefield.length;
    cast(game, spell);
    expect(zone(game, spell)).toBe("hand");
    expect(game.state.zones.shared.battlefield.length).toBe(battlefield + 1);
  });

  it("Echocasting Symposium: target player creates the copy, and the spell is exiled", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 6);
    const spell = toHand(game, "Echocasting Symposium");
    cast(game, spell, { targets: [ref(B), ref(giant)] });
    expect(onBattlefield(game, "Hill Giant", B).length).toBe(1);
    expect(zone(game, spell)).toBe("exile");
  });

  it("Season of Gathering: the same mode twice, and the artifact half of the second", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const rock = spawn(game, "Mind Stone", B);
    const ring = spawn(game, "Oblivion Ring", B);
    lands(game, "Forest", 6);
    pickPermanents(a, bear);
    a.chooseModesFn = () => [0];
    cast(game, toHand(game, "Season of Gathering"), { modes: [0, 0, 1] });
    expect(counters(game, bear)).toBe(2);
    expect(keywords(game, bear).has("trample")).toBe(true);
    expect(zone(game, rock)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("Season of Weaving: a copy of your creature, then nonland nontoken permanents return", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    pickPermanents(a, giant);
    cast(game, toHand(game, "Season of Weaving"), { modes: [1, 2] });
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(onBattlefield(game, "Hill Giant").length).toBe(1);
  });

  it("Cry of the Carnarium: creatures it kills are exiled, and so are creature cards put there this turn", () => {
    const { game } = table();
    const old = toGraveyard(game, "Hill Giant", B);
    const earlier = spawn(game, "Hill Giant", B);
    destroy(game, earlier);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Cry of the Carnarium"));
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, earlier)).toBe("exile");
    expect(zone(game, old)).toBe("graveyard");
  });

  it("Consign to Memory and Louisoix's Sacrifice: a colorless spell is a target, a creature spell only not", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const consign = toHand(game, "Consign to Memory");
    const louisoix = toHand(game, "Louisoix's Sacrifice");
    const options = (card: ObjectId): number =>
      game
        .legalActions(A)
        .flatMap((o) => (o.kind === "cast-spell" && o.card === card ? o.targetOptions.flat() : [])).length;
    const bears = bobCasts(game, "Grizzly Bears", "Forest", 2);
    expect(zone(game, bears)).toBe("stack");
    expect(options(consign)).toBe(0);
    expect(options(louisoix)).toBe(0);
    settle(game);
    lands(game, "Wastes", 2, B);
    const stone = toHand(game, "Mind Stone", B);
    cast(game, stone, { player: B, settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(options(consign)).toBeGreaterThan(0);
    expect(options(louisoix)).toBeGreaterThan(0);
  });

  it("Faith & Grief: up to two artifact or enchantment cards back, and Ishgard playable from exile", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const stone = toGraveyard(game, "Mind Stone");
    const card = toHand(game, "Ishgard, the Holy See");
    game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [ref(stone)] });
    settle(game);
    expect(zone(game, stone)).toBe("hand");
    expect(zone(game, card)).toBe("exile");
    game.dispatch({ type: "play-land", player: A, card, face: 0 });
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
  });

  it("Overture: target opponent mills half their library, rounded down", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const library = game.state.zones.perPlayer[B].library.length;
    const card = toHand(game, "Jidoor, Aristocratic Capital");
    game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [ref(B)] });
    settle(game);
    expect(game.state.zones.perPlayer[B].library.length).toBe(library - Math.floor(library / 2));
  });

  it("Lasting Fayth: a 1/1 Hero with a +1/+1 counter for each land you control", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const card = toHand(game, "Zanarkand, Ancient Metropolis");
    game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [] });
    settle(game);
    const [hero] = named(game, "Hero Token (Black Mage's Rod)", A);
    expect(counters(game, hero)).toBe(6);
  });

  it("Zndrsplt's Judgment: a friend copies a creature of theirs, a foe returns one", () => {
    const { game, a, b } = table();
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    a.chooseModesFn = (_v, _min, _max, texts) => [texts[0].toLowerCase().startsWith("alice") ? 0 : 1];
    a.choosePermanentsFn = (_v, eligible) => eligible.slice(0, 1);
    b.choosePermanentsFn = (_v, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Zndrsplt's Judgment"));
    expect(onBattlefield(game, "Hill Giant").length).toBe(2);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("hand");
  });

  it("Regna's Sanction: friends' creatures get counters; a foe keeps one untapped and taps the rest", () => {
    const { game, a, b } = table();
    const mine = spawn(game, "Hill Giant");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    a.chooseModesFn = (_v, _min, _max, texts) => [texts[0].toLowerCase().startsWith("alice") ? 0 : 1];
    b.choosePermanentsFn = (_v, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Regna's Sanction"));
    expect(counters(game, mine)).toBe(1);
    expect(game.state.objects[mine].tapped).toBe(false);
    expect([game.state.objects[one].tapped, game.state.objects[two].tapped].filter(Boolean).length).toBe(1);
  });
});

describe("planeswalkers", () => {
  it("Gideon Jura's 0: a 6/6 creature until end of turn, all damage to him prevented", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon Jura");
    loyalty(game, gideon, 0);
    expect(pt(game, gideon)).toEqual({ power: 6, toughness: 6 });
    damage(game, 5, gideon);
    expect(game.state.objects[gideon].counters.loyalty).toBe(6);
  });

  it("Nicol Bolas, God-Pharaoh's +1: each opponent exiles two cards from their hand", () => {
    const { game } = table();
    const bolas = spawn(game, "Nicol Bolas, God-Pharaoh");
    const before = hand(game, B).length;
    loyalty(game, bolas, 1);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("enchantments", () => {
  it("Dual Nature: a nontoken creature's controller gets a copy; it leaving exiles its namesakes", () => {
    const { game } = table();
    spawn(game, "Dual Nature");
    const bear = enter(game, "Grizzly Bears", B);
    expect(onBattlefield(game, "Grizzly Bears", B).length).toBe(2);
    destroy(game, bear);
    expect(onBattlefield(game, "Grizzly Bears", B).length).toBe(0);
  });

  it("Dual Nature: leaving, it exiles the tokens it made", () => {
    const { game } = table();
    const nature = spawn(game, "Dual Nature");
    enter(game, "Grizzly Bears", B);
    destroy(game, nature, A);
    expect(onBattlefield(game, "Grizzly Bears", B).length).toBe(1);
  });

  it("Tombstone Stairwell: Tombspawn for each creature card in each graveyard, destroyed at the end step", () => {
    const { game } = table();
    spawn(game, "Tombstone Stairwell");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears", B);
    nextTurn(game, "draw");
    expect(tokensNamed(game, "Tombspawn", B)).toBe(2);
    expect(tokensNamed(game, "Tombspawn", A)).toBe(0);
    game.advanceUntil((s) => s.turn.step === "cleanup");
    expect(tokensNamed(game, "Tombspawn", B)).toBe(0);
  });

  it("Outlaws' Merriment: one of its three tokens each upkeep", () => {
    const { game } = table();
    spawn(game, "Outlaws' Merriment");
    nextTurn(game);
    nextTurn(game);
    const made =
      tokensNamed(game, "3/1 Red and White Human Warrior Token (Trample, Haste)", A) +
      tokensNamed(game, "2/1 Red and White Human Cleric Token (Lifelink, Haste)", A) +
      tokensNamed(game, "1/2 Red and White Human Rogue Token (Haste, Ping)", A);
    expect(made).toBe(1);
  });

  it("Words of Wind: the next draw is replaced by each player returning a permanent", () => {
    const { game } = table();
    const words = spawn(game, "Words of Wind");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    activate(game, words, 0);
    const before = hand(game).length;
    draw(game);
    expect(zone(game, bear)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Godsend: the equipped blocker may exile the creature it blocks, and opponents can't cast its namesakes", () => {
    const { game, a } = table();
    const godsend = spawn(game, "Godsend");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, godsend, 0, { targets: [ref(bear)] });
    nextTurn(game);
    const giant = spawn(game, "Hill Giant", B);
    a.declareBlockersFn = () => [{ blocker: bear, attacker: giant }];
    a.choosePermanentsFn = (_v, eligible) => eligible.filter((id) => id === giant);
    attack(game, seats.b!, [giant], A);
    expect(zone(game, giant)).toBe("exile");
    lands(game, "Mountain", 4, B);
    const another = toHand(game, "Hill Giant", B);
    expect(game.legalActions(B).some((o) => o.kind === "cast-spell" && o.card === another)).toBe(false);
  });

  it("Experimental Lab: unlocking manifests dread with two +1/+1 counters and trample", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Experimental Lab // Staff Room"), { face: 1, targets: [] });
    const faceDown = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);
    expect(faceDown.length).toBe(1);
    expect(pt(game, faceDown[0])).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, faceDown[0]).has("trample")).toBe(true);
  });

  it("Staff Room: a creature dealing combat damage to a player gets a +1/+1 counter", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Experimental Lab // Staff Room"), { face: 2, targets: [] });
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    attack(game, a, [bear]);
    expect(counters(game, bear)).toBe(1);
  });

  it("Forgotten Cellar: unlocking it, cards that would go to your graveyard this turn are exiled", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Walk-In Closet // Forgotten Cellar"), { face: 2, targets: [] });
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    expect(zone(game, bear)).toBe("exile");
  });

  it("Ashiok's Erasure: exiles a spell, locks its name, and hands it back as it leaves", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = bobCasts(game, "Grizzly Bears", "Forest", 4);
    const erasure = toHand(game, "Ashiok's Erasure");
    cast(game, erasure, { targets: [] });
    expect(zone(game, bears)).toBe("exile");
    const another = toHand(game, "Grizzly Bears", B);
    expect(game.legalActions(B).some((o) => o.kind === "cast-spell" && o.card === another)).toBe(false);
    destroy(game, erasure);
    expect(zone(game, bears)).toBe("hand");
  });

});
